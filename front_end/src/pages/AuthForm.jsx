import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../utils/userSlice";
import Input from "../componants/Input";
import googleIcon from "../assets/google-icon.svg";
import { GoogleAuth } from "../../utils/fireBase";
function AuthForm({ type }) {
  const navigate = useNavigate();
  const [userdata, setUserdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/${type}`,
        userdata,
      );

      if (type != "signin") {
        toast.success(response.data.message);
        navigate("/signin");
      } else {
        dispatch(login(response.data.user));
        let msg = response.data.message;
        toast.success(msg);
        // console.log(msg);
        if (msg == "Account created! Please SignIn  💁‍♂️") {
          navigate("/signin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  async function handleGoogleAuth() {
    try {
      let data = await GoogleAuth();
      console.log(data.photoURL);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/google-auth`,
        {
          accessToken: data.accessToken,
        },
      );
      //console.log(response);
      dispatch(login(response?.data?.user));
      toast.success(response?.data?.message);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  }

  return (
    <>
      {/* UPDATED container + card + typography */}
      <div className="min-h-screen bg-gradient-br from-indigo-50 via-white to-gray-100 flex items-center justify-center px-4 sm:px-6 font-serif">
        <div className="w-full mb-5 max-w-md md:max-w-sm">
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 sm:p-10 border mb-10 border-gray-100">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 text-center tracking-tight">
                {type == "signin" ? "Sign In" : "Sign Up/Create"}
              </h1>
            </div>

            {/* UPDATED spacing */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {type == "signup" && (
                <div>
                  {/* UPDATED label spacing */}
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  {/* ADDED input styling */}
                  <Input
                    id={"name"}
                    type={"text"}
                    autoComplete={"name"}
                    placeholder={"please enter your name"}
                    value={userdata.name}
                    setUserdata={setUserdata}
                    field={"name"}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Input
                  id={"email"}
                  type={"email"}
                  autoComplete={"email"}
                  placeholder={"please enter your email"}
                  value={userdata.email}
                  setUserdata={setUserdata}
                  field={"email"}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <Input
                  id={"password"}
                  type={"password"}
                  autoComplete={"current-password"}
                  placeholder={"*******"}
                  value={userdata.password}
                  setUserdata={setUserdata}
                  field={"password"}
                />
              </div>

              <div className="text-center m-0">
                <p>or</p>
              </div>
              <div className="flex items-center justify-center">
                <div
                  onClick={handleGoogleAuth}
                  className=" flex flex-row justify-center items-center gap-2 font-serif font-semibold bg-gray-200 px-4 py-1 rounded-3xl hover:bg-blue-400 cursor-pointer"
                >
                  Continue with
                  <img className="h-6" src={googleIcon} alt="" />
                </div>
              </div>

              {/* UPDATED button styles */}
              <button
                type="submit"
                className={`flex w-full items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-semibold  text-white cursor-pointer shadow-sm transition-all hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:scale-[0.99]`}
              >
                {type == "signin" ? "signin" : "signup"}
              </button>
            </form>

            {/* UPDATED link interaction */}

            {type == "signin" ? (
              <p className="mt-4 text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  to={"/signup"}
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline"
                >
                  Create one
                </Link>
              </p>
            ) : (
              <p className="mt-4 text-center text-sm text-gray-600">
                already have an account?{" "}
                <Link
                  to={"/signin"}
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthForm;
