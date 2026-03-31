import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow
})

const Map = () => {

    const position: [number, number] = [6.5244, 3.3792]

  return (
    <MapContainer
    center={position}
    zoom={13}
    style={{height: "200px", width: "100%", backgroundColor: "red", overflow: "hidden"}}
    >
        <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}> 
            <Popup> 
                Warehouse
            </Popup>
        </Marker>
    </MapContainer>
  )
}

export default Map

