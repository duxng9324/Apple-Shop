package com.business.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.business.converter.OrderConverter;
import com.business.converter.OrderItemConverter;
import com.business.dto.OrderDTO;
import com.business.dto.OrderItemDTO;
import com.business.entity.ColorEntity;
import com.business.entity.InventoryEntity;
import com.business.entity.OrderEntity;
import com.business.entity.OrderItemEntity;
import com.business.entity.ProductEntity;
import com.business.repository.InventoryRepository;
import com.business.repository.ColorRepository;
import com.business.repository.OrderItemRepository;
import com.business.repository.OrderRepository;
import com.business.repository.ProductRepository;
import com.business.repository.StockReceiptItemRepository;
import com.business.entity.StockReceiptItemEntity;
import com.business.service.IOrderService;

@Service
public class OrderService implements IOrderService {

	private static final String STATUS_WAITING_CONFIRM = "Chờ xác nhận";
	private static final String STATUS_CONFIRMED = "Đã xác nhận";
	private static final String STATUS_SHIPPING = "Đang vận chuyển";
	private static final String STATUS_DELIVERING = "Đang giao hàng";
	private static final String STATUS_DELIVERED = "Giao hàng thành công";
	private static final String STATUS_COMPLETED = "Đơn hàng đã được hoàn thành";
	private static final String STATUS_CANCELLED = "Hủy đơn hàng";

	private static final String PAYMENT_PAID = "Đã thanh toán";
	private static final String PAYMENT_UNPAID = "Chưa thanh toán";

	private static final Map<String, Set<String>> ALLOWED_STATUS_TRANSITIONS = createAllowedStatusTransitions();

	@Autowired
	private OrderConverter orderConverter;
	
	@Autowired
	private OrderItemConverter orderItemConverter;
	
	@Autowired
	private OrderRepository orderRepository;
	
	@Autowired
	private OrderItemRepository orderItemRepository;

	@Autowired
	private InventoryRepository inventoryRepository;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private StockReceiptItemRepository stockReceiptItemRepository;

	@Autowired
	private ColorRepository colorRepository;

	@Autowired
	private AccountingPostingService accountingPostingService;

	@Override
	@Transactional
	public OrderDTO save(OrderDTO orderDTO) {
		OrderEntity orderEntity = orderRepository.save(orderConverter.toEntity(orderDTO));
		Long orderId = orderEntity.getId();
		List<OrderItemDTO> orderItemDTOs = orderDTO.getOrderItemDTOs();
		for(OrderItemDTO orderItemDTO : orderItemDTOs) {
			orderItemDTO.setOrderId(orderId);
			OrderItemEntity orderItemEntity = orderItemConverter.toEntity(orderItemDTO);
			orderItemRepository.save(orderItemEntity);
		}

		deductInventoryForOrder(orderEntity, "FIFO");
		orderEntity.setInventoryDeducted(true);
		orderRepository.save(orderEntity);
		accountingPostingService.postOrderCreated(orderEntity);
		return orderConverter.toDTO(orderEntity);
	}

	@Override
	public List<OrderDTO> getOrderByUserId(Long userId) {
		List<OrderEntity> orderEntities = orderRepository.findByUserId(userId);
		List<OrderDTO> orderDTOs = new ArrayList<>();
		for(OrderEntity orderEntity : orderEntities) {
			OrderDTO orderDTO = orderConverter.toDTO(orderEntity);
			orderDTOs.add(orderDTO);
		}
		return orderDTOs;
	}

	@Override
	@Transactional
	public OrderDTO updateStatusOrder(Long id, String status, String paymentStatus, String strategy) {
		   OrderEntity orderEntity = orderRepository.findById(id).orElse(null);
		if (orderEntity == null) {
			throw new RuntimeException("Order not found");
		}

		String nextStatus = normalizeStatus(status);
		validateStatusTransition(orderEntity.getStatus(), nextStatus);
		String previousPaymentStatus = orderEntity.getPaymentStatus();

		if (shouldDeductInventory(nextStatus) && !Boolean.TRUE.equals(orderEntity.getInventoryDeducted())) {
			deductInventoryForOrder(orderEntity, strategy);
			orderEntity.setInventoryDeducted(true);
		}

		orderEntity.setStatus(nextStatus);
		if (paymentStatus != null && !paymentStatus.trim().isEmpty()) {
			String normalizedPaymentStatus = normalizePaymentStatus(paymentStatus);
			orderEntity.setPaymentStatus(normalizedPaymentStatus);
			if (isPaidStatus(normalizedPaymentStatus) && orderEntity.getPaidTime() == null) {
				orderEntity.setPaidTime(new Date());
			}
		}

		orderRepository.save(orderEntity);
		accountingPostingService.postOrderCreated(orderEntity);
		if (!isPaidStatus(previousPaymentStatus) && isPaidStatus(orderEntity.getPaymentStatus())) {
			accountingPostingService.postOrderPayment(orderEntity);
		}
		return orderConverter.toDTO(orderEntity);
	}

	@Override
	public List<OrderDTO> getAllOrder() {
		List<OrderEntity> orderEntities = orderRepository.findAll();
		List<OrderDTO> orderDTOs = new ArrayList<>();
		for(OrderEntity orderEntity : orderEntities) {
			OrderDTO orderDTO = orderConverter.toDTO(orderEntity);
			orderDTOs.add(orderDTO);
		}
		return orderDTOs;
	}

	@Override
	public String changeCheck(Long id) {
		OrderEntity orderEntity = orderRepository.findById(id).orElse(null);
		if (orderEntity == null) {
			throw new RuntimeException("Order not found");
		}
		orderEntity.setCheckCmt(1);
		orderRepository.save(orderEntity);
		return "ok";
	}

	@Override
	@Transactional
	public OrderDTO markOrderPaid(Long id) {
		OrderEntity orderEntity = orderRepository.findById(id).orElse(null);
		if (orderEntity == null) {
			throw new RuntimeException("Order not found");
		}

		if (STATUS_CANCELLED.equalsIgnoreCase(normalizeStatus(orderEntity.getStatus()))) {
			throw new RuntimeException("Cannot mark payment for cancelled order");
		}

		String previousPaymentStatus = orderEntity.getPaymentStatus();
		if (isPaidStatus(previousPaymentStatus)) {
			return orderConverter.toDTO(orderEntity);
		}

		orderEntity.setPaymentStatus(PAYMENT_PAID);
		if (orderEntity.getPaidTime() == null) {
			orderEntity.setPaidTime(new Date());
		}
		orderRepository.save(orderEntity);

		accountingPostingService.postOrderCreated(orderEntity);
		accountingPostingService.postOrderPayment(orderEntity);

		return orderConverter.toDTO(orderEntity);
	}

	private boolean shouldDeductInventory(String status) {
		if (status == null) {
			return false;
		}

		String normalized = status.toLowerCase(Locale.ROOT);
		return normalized.contains("xác nhận") || normalized.contains("xac nhan") || normalized.contains("giao hàng thành công")
				|| normalized.contains("giao hang thanh cong") || normalized.contains("hoàn thành")
				|| normalized.contains("hoan thanh");
	}

	private boolean isPaidStatus(String paymentStatus) {
		if (paymentStatus == null) {
			return false;
		}

		String normalized = normalizePaymentStatus(paymentStatus);
		return PAYMENT_PAID.equalsIgnoreCase(normalized);
	}

	private String normalizePaymentStatus(String paymentStatus) {
		if (paymentStatus == null) {
			return PAYMENT_UNPAID;
		}

		String normalized = paymentStatus.trim().toLowerCase(Locale.ROOT);
		if (normalized.contains("đã thanh toán") || normalized.contains("da thanh toan")
				|| normalized.contains("paid") || normalized.contains("success")) {
			return PAYMENT_PAID;
		}
		return PAYMENT_UNPAID;
	}

	private String normalizeStatus(String status) {
		if (status == null) {
			throw new RuntimeException("Order status is required");
		}
		return status.trim();
	}

	private void validateStatusTransition(String currentStatus, String nextStatus) {
		if (nextStatus == null || nextStatus.isEmpty()) {
			throw new RuntimeException("Order status is required");
		}

		if (currentStatus == null || currentStatus.trim().isEmpty() || currentStatus.equals(nextStatus)) {
			return;
		}

		Set<String> allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS.get(currentStatus.trim());
		if (allowedNextStatuses == null || !allowedNextStatuses.contains(nextStatus)) {
			throw new RuntimeException("Invalid order status transition from " + currentStatus + " to " + nextStatus);
		}
	}

	private static Map<String, Set<String>> createAllowedStatusTransitions() {
		Map<String, Set<String>> transitions = new HashMap<>();
		transitions.put(STATUS_WAITING_CONFIRM,
				new HashSet<>(Arrays.asList(STATUS_CONFIRMED, STATUS_CANCELLED)));
		transitions.put(STATUS_CONFIRMED,
				new HashSet<>(Arrays.asList(STATUS_SHIPPING, STATUS_CANCELLED)));
		transitions.put(STATUS_SHIPPING,
				new HashSet<>(Arrays.asList(STATUS_DELIVERING, STATUS_CANCELLED)));
		transitions.put(STATUS_DELIVERING,
				new HashSet<>(Arrays.asList(STATUS_DELIVERED, STATUS_CANCELLED)));
		transitions.put(STATUS_DELIVERED,
				new HashSet<>(Collections.singletonList(STATUS_COMPLETED)));
		transitions.put(STATUS_COMPLETED, Collections.<String>emptySet());
		transitions.put(STATUS_CANCELLED, Collections.<String>emptySet());
		return transitions;
	}

	private void deductInventoryForOrder(OrderEntity orderEntity, String strategy) {
		List<OrderItemEntity> items = orderItemRepository.findByOrderId(orderEntity.getId());
		String issueStrategy = normalizeStrategy(strategy);

		for (OrderItemEntity item : items) {
			ProductEntity product = resolveProduct(item);
			if (product == null) {
				throw new RuntimeException("Cannot resolve product for order item: " + item.getName());
			}

			String memoryType = item.getMemory() == null ? "DEFAULT" : item.getMemory().trim().toUpperCase();
			ColorEntity color = resolveColor(item.getColor());
			int qty = item.getQuantity();
			if (qty <= 0) {
				continue;
			}

			List<StockReceiptItemEntity> layers;
			if (color != null) {
				layers = "LIFO".equals(issueStrategy)
						? stockReceiptItemRepository.findByProductIdAndColorIdAndMemoryTypeAndRemainingQuantityGreaterThanOrderByStockReceiptReceiptDateDescIdDesc(
								product.getId(), color.getId(), memoryType, 0)
						: stockReceiptItemRepository.findByProductIdAndColorIdAndMemoryTypeAndRemainingQuantityGreaterThanOrderByStockReceiptReceiptDateAscIdAsc(
								product.getId(), color.getId(), memoryType, 0);
			} else {
				layers = "LIFO".equals(issueStrategy)
						? stockReceiptItemRepository.findByProductIdAndMemoryTypeAndRemainingQuantityGreaterThanOrderByStockReceiptReceiptDateDescIdDesc(
								product.getId(), memoryType, 0)
						: stockReceiptItemRepository.findByProductIdAndMemoryTypeAndRemainingQuantityGreaterThanOrderByStockReceiptReceiptDateAscIdAsc(
								product.getId(), memoryType, 0);
			}

			if (layers == null || layers.isEmpty()) {
				List<InventoryEntity> inventories;
				if (color != null) {
					inventories = inventoryRepository
							.findByProductIdAndColorIdAndMemoryTypeAndQuantityGreaterThanOrderByQuantityDesc(product.getId(),
									color.getId(), memoryType, 0);
				} else {
					inventories = inventoryRepository
							.findByProductIdAndMemoryTypeAndQuantityGreaterThanOrderByQuantityDesc(product.getId(), memoryType, 0);
				}
				InventoryEntity selected = null;
				for (InventoryEntity inv : inventories) {
					if (inv.getQuantity() != null && inv.getQuantity() >= qty) {
						selected = inv;
						break;
					}
				}

				if (selected == null) {
					throw new RuntimeException("Insufficient inventory for product " + product.getCode() + " - " + memoryType);
				}

				selected.setQuantity(selected.getQuantity() - qty);
				inventoryRepository.save(selected);
				continue;
			}

			int totalLayerQty = 0;
			for (StockReceiptItemEntity layer : layers) {
				Integer remainingQty = layer.getRemainingQuantity();
				if (remainingQty != null) {
					totalLayerQty += remainingQty;
				}
			}

			if (totalLayerQty < qty) {
				throw new RuntimeException("Insufficient inventory for product " + product.getCode() + " - " + memoryType);
			}

			int required = qty;
			for (StockReceiptItemEntity layer : layers) {
				if (required <= 0) {
					break;
				}

				Integer remainingQty = layer.getRemainingQuantity();
				int available = 0;
				if (remainingQty != null) {
					available = remainingQty;
				}
				if (available <= 0) {
					continue;
				}

				int take = Math.min(required, available);
				layer.setRemainingQuantity(available - take);
				stockReceiptItemRepository.save(layer);

				Long warehouseId = layer.getStockReceipt().getWarehouse().getId();
				InventoryEntity inventory;
				if (layer.getColor() != null) {
					inventory = inventoryRepository
							.findByWarehouseIdAndProductIdAndColorIdAndMemoryType(warehouseId, product.getId(),
									layer.getColor().getId(), memoryType)
							.orElse(null);
				} else {
					inventory = inventoryRepository
							.findByWarehouseIdAndProductIdAndMemoryType(warehouseId, product.getId(), memoryType)
							.orElse(null);
				}
				if (inventory == null || inventory.getQuantity() == null || inventory.getQuantity() < take) {
					throw new RuntimeException("Inventory ledger mismatch for product " + product.getCode() + " - " + memoryType);
				}

				inventory.setQuantity(inventory.getQuantity() - take);
				inventoryRepository.save(inventory);

				required -= take;
			}
		}
	}

	private String normalizeStrategy(String strategy) {
		if (strategy == null) {
			return "FIFO";
		}

		String normalized = strategy.trim().toUpperCase(Locale.ROOT);
		if ("LIFO".equals(normalized)) {
			return "LIFO";
		}
		return "FIFO";
	}

	private ProductEntity resolveProduct(OrderItemEntity item) {
		if (item.getProductIdRef() != null) {
			ProductEntity byId = productRepository.findById(item.getProductIdRef()).orElse(null);
			if (byId != null) {
				return byId;
			}
		}

		if (item.getProductCode() != null && !item.getProductCode().trim().isEmpty()) {
			ProductEntity byCode = productRepository.findByCode(item.getProductCode().trim());
			if (byCode != null) {
				return byCode;
			}
		}

		if (item.getName() != null && !item.getName().trim().isEmpty()) {
			return productRepository.findByName(item.getName().trim());
		}

		return null;
	}

	private ColorEntity resolveColor(String colorName) {
		if (colorName == null || colorName.trim().isEmpty()) {
			return null;
		}

		return colorRepository.findByColorIgnoreCase(colorName.trim());
	}
	
}
