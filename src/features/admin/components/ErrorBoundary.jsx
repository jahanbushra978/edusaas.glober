"use client";

import { Component } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getErrorMessage } from "@/lib/error-messages";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const lang = this.props.lang || "bn";
      return (
        <Card className="border-red-200">
          <CardContent className="p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
            <p className="text-sm text-muted-foreground">
              {getErrorMessage("internal_error", lang)}
            </p>
            <Button variant="outline" size="sm" onClick={this.handleRetry}>
              <RefreshCw className="w-4 h-4 mr-1" /> {lang === "bn" ? "পুনরায় চেষ্টা করুন" : "Retry"}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
