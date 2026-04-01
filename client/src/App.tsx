import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import NavBar from "./components/NavBar";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CommandDashboard from "./pages/CommandDashboard";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/command"} component={CommandDashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <NavBar />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
