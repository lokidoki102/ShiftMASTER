import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const AuthListener = () => {
  const history = useHistory();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is not signed in, redirect to login page
        history.push("/login");
      }
    });

    return () => unsubscribe();
  }, [history]);

  return null;
};

export default AuthListener;
