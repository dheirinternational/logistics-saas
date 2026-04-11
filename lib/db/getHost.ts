export function getHost(req: Request){
    const host = req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    
    return `${protocol}://${host}`;
}