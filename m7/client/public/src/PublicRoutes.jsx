import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom"

import PublicHomepage from "./components/pages/PublicHomepage"
import PublicLanding from "./components/pages/PublicLanding"
import Signature from "./components/pages/Signature"
import AdminLogin from "./components/auth/AdminLogin"
import AdminLogout from "./components/auth/AdminLogout"
import LoginContext from "./components/Contexts/LoginContext"
import { useEffect, useState } from "react"
import getCookie from "./components/auth/Cookies"
import Download from "./components/pages/Download"
import Contribute from "./components/pages/Contribute"
import SpecimenReports from "./components/pages/SpecimenReports"

function PublicRoutes() {

  const [curUsername, setCurUsername] = useState();

  useEffect(() => {    
    fetch("/api/get_user", {
        method: "POST",
        credentials: "include",
        headers: {
            "X-CSRF-TOKEN": getCookie("csrf_access_token")
        }

    }).then(res => res.json())
    .then(result=>{
      if (result?.error === false) {
        setCurUsername(result.username);
      } else {
        setCurUsername(false);
      }
    })
    .catch(err=>console.log(err));
  }, [])

  return <LoginContext.Provider value={[curUsername, setCurUsername]}>
  <HashRouter>
    <Routes>
      <Route path='/' element={<PublicHomepage />}>
        <Route index element={<Signature />} />
        <Route path='login' element={<AdminLogin />} />
        <Route path="*" element={<PublicLanding />} />
        <Route path='logout' element={<AdminLogout />} />
        <Route path='download' element={<Download />} />
        <Route path='contribute' element={<Contribute />} />
        <Route path='reports' element={<SpecimenReports />} />
      </Route>
    </Routes>
  </HashRouter>
  </LoginContext.Provider>
}

export default PublicRoutes
