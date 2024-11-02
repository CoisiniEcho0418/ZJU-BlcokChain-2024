import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage: string;
}

interface ErrorBoundaryProps {
    children: ReactNode; // 声明 children 属性
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, errorMessage: error.message };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    handleClose = () => {
        this.setState({ hasError: false, errorMessage: '' });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h2>发生错误</h2>
                        <p>{this.state.errorMessage}</p>
                        <button onClick={this.handleClose} style={buttonStyle}>
                            关闭
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children; // 返回子组件
    }
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
};

const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '10px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
};

export default ErrorBoundary;
