import { csrf_token_cookie, getReportPicPath } from "../../../../../paths/clientPaths";
import getCookie from "../auth/Cookies";
import { useEffect, memo } from "react";
import useObjectURL from "../hooks/useObjectURL";

function ReportPictureFunc(props) {
    
    function getPic(path, setUrl) {
        fetch(getReportPicPath, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "X-CSRF-TOKEN": getCookie(csrf_token_cookie)
            },
            body: JSON.stringify({'path': path})
        }).then(res => res.blob())
        .then(blob => setUrl(blob))
        .catch(err => console.log(err));
    }
    
    const [url, setUrl] = useObjectURL();
    useEffect(()=>{
        getPic(props.path, setUrl);
        return () => {
            if (url) {
                setUrl(null);
            }
        }
    }, [props])

    return <img 
        src={url} 
        alt={"An image of a specimen record"} 
        style={{
            width: "100%",
            aspectRatio: 1/1
        }}
    />
}

const ReportPicture = memo(ReportPictureFunc, (prev, next) => {
    return prev?.path===next?.path;
});

export default ReportPicture;