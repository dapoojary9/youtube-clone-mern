import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="empty">
      <h1 className="big-404">404</h1>
      <h2>This page isn&apos;t available</h2>
      <p>Sorry about that. Try searching for something else.</p>
      <Link to="/" className="btn btn--primary">Go to Home</Link>
    </div>
  );
}
