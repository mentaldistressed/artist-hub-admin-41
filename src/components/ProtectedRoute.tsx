import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'artist' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { 
    isLoading, 
    isInitialized, 
    user, 
    profile, 
    error,
    retry,
    refreshAuth,
    retryCount,
    clearError 
  } = useAuth();

  // Show loading spinner during initialization
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner 
            size="lg" 
            message="Initializing application..." 
          />
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Retry attempt {retryCount}/3
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show error state with retry options
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Authentication Error
            </CardTitle>
            <CardDescription>
              There was a problem with authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={retry} 
                variant="default" 
                size="sm"
                disabled={retryCount >= 3}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
              </Button>
              
              <Button 
                onClick={refreshAuth} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Refresh Authentication
              </Button>
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost" 
                size="sm"
                className="w-full"
              >
                Reload Page
              </Button>
              
              {error && (
                <Button 
                  onClick={clearError} 
                  variant="ghost" 
                  size="sm"
                  className="w-full text-muted-foreground"
                >
                  Dismiss Error
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user || !profile) {
    return <AuthForm />;
  }

  // Check role permissions
  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Required role: {requiredRole === 'admin' ? 'Administrator' : 'Artist'}
            </p>
            <p className="text-sm text-muted-foreground">
              Your role: {profile.role === 'admin' ? 'Administrator' : 'Artist'}
            </p>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline" 
              size="sm"
              className="w-full mt-4"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};