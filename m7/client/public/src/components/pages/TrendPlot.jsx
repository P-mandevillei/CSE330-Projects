import { memo, useEffect } from "react";
import { csrf_token_cookie, getSignPicPath } from "../../../../../paths/clientPaths";
import getCookie from "../auth/Cookies";
import useObjectURL from "../hooks/useObjectURL";

function getPlot() {
    const [trendBarUrl, setTrendBarUrl] = useObjectURL();

    useEffect(() => {
        
        fetch(getSignPicPath, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CSRF-TOKEN": getCookie(csrf_token_cookie)
            }
        }).then(res => {
            if (res.status === 200) {
                return res.blob();
            } else {
                return "";
            }
        }).then(blob => {
            setTrendBarUrl(blob);
        })
        .catch(err => console.log(err));

        return ()=>{
            if (trendBarUrl) {
                setTrendBarUrl(null);
            }
        }
    }, [])

    return <img 
        src={trendBarUrl} 
        alt="A barplot showing the trend of signatures in the past 7 days"  
    />
}

const TrendPlot = memo(getPlot);
export default TrendPlot;