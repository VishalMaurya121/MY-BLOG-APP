import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen  bg-gray-50 flex items-center font-serif">
      <div className="max-w-3xl mx-auto px-6 py-15 mb-15 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-700 mb-3 capitalize">
          welcome to our blog app 🤗.
        </h1>

        <p className="text-base text-gray-600 font-bold">
          "Stories that connect the world"
        </p>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          A platform for sharing thoughts, experiences, and knowledge through
          written posts, where readers can interact by commenting and liking
          content.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/blogs"
            className="inline-flex items-center px-5 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            Explore Articles
          </Link>
        </div>

        <div className="mt-6 flex justify-center items-center gap-3">
          <div className="mt-8 flex justify-center gap-3">
            <Link to={`/search?q=Guides`}>
              <span className="px-3 py-1 bg-white text-sm rounded-full shadow-sm  hover:bg-gray-700 hover:text-white transition">
                Guides 😊
              </span>
            </Link>
            <Link to={`/search?q=CaseStudies`}>
              <span className="px-3 py-1 bg-white text-sm rounded-full shadow-sm  hover:bg-gray-700 hover:text-white transition">
                Case Studies 😊
              </span>
            </Link>
            <Link to={`/search?q=Resources`}>
              <span className="px-3 py-1 bg-white text-sm rounded-full shadow-sm  hover:bg-gray-700 hover:text-white transition">
                Resources 😊
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
