import axios from "axios";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const VerifyUser = () => {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    async function VerifyUser() {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/verify-email/${verificationToken}`,
        );

        toast.success(response?.data?.message);
      } catch (error) {
        toast.error(error?.response?.data.message);
      } finally {
        navigate("/signin");
      }
    }
    VerifyUser();
  }, [verificationToken]);

  return <div>Verification under process</div>;
};

export default VerifyUser;
