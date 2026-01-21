import { Link } from "react-router";

const BackToHomepage = () => {
  return (
    <div>
      {/* Back to homepage button in top-left */}
      <Link to="/" className="absolute top-6 left-6 btn btn-sm btn-outline">
        Back to Homepage
      </Link>
    </div>
  );
};

export default BackToHomepage;
