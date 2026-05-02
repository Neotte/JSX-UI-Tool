import React from "react";

type Props = {
  children: React.ReactNode;
  onError: (message: string) => void;
};

type State = {
  error: string | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error: error.message };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.children !== this.props.children && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return <div className="preview-error">JSX 렌더링 중 오류가 발생했습니다.</div>;
    }

    return this.props.children;
  }
}
