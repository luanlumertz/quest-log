import { AppRoutes } from "./routes/AppRoutes";

function App() {
    return (
        <div onDragStart={(event) => event.preventDefault()}>
            <AppRoutes />
        </div>
    );
};

export default App;
