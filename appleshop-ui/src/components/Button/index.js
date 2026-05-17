function Button(props) {
    const { type, size, color, children, onclick, text, disabled } = props;

    const styles = {
        fontSize: size === 'large' ? '24px' : '16px',
        padding: size === 'large' ? '12px 24px' : '8px 16px',
        backgroundColor: color,
        color: text ? text : '#fff',
        borderRadius: '4px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
    };

    return (
        <button type={type} style={styles} onClick={onclick} disabled={disabled}>
            {children}
        </button>
    );
}

export default Button;
