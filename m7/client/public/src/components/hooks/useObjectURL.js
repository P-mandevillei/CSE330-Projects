import { useState } from "react";

export default function useObjectURL() {
    const [url, setUrl] = useState(null);

    function setImageUrl(blob) {
        setUrl(old => {
            if (old) {
                URL.revokeObjectURL(old);
            }
            if (blob) {
                return URL.createObjectURL(blob);
            } else {
                return null;
            }
        });
    }

    return [url, setImageUrl];
}