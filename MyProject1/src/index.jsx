import { Link } from "react-router-dom";

export default function Index() {
    return (
        <>
            <h1>IT</h1>
            <h2>Welcome to IT</h2>
            <Link to="/">Home</Link>
            <br />
            <Link to="/login">Login</Link>
            <br />
            <Link to="/register">Register</Link>
        </>
    );
}