import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-medium mb-4 text-foreground">404</h1>
        <p className="text-lg text-muted-foreground mb-6">Страница не найдена</p>
        <Button onClick={() => navigate('/')} variant="outline">
          Вернуться на главную
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
