import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Erro na aplicação:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy px-6 text-center">
          <h1 className="font-playfair text-3xl text-white">Algo saiu do aquário...</h1>
          <p className="text-muted-foreground">Ocorreu um erro inesperado ao carregar esta página.</p>
          <button
            className="rounded-full bg-aqua px-6 py-2.5 font-semibold text-navy"
            onClick={() => window.location.reload()}
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
