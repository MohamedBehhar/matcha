import axios from "axios";

export const getNavigatorLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
	if ("geolocation" in navigator) {
	  navigator.geolocation.getCurrentPosition(resolve, reject);
	} else {
	  reject(new Error("Geolocation is not supported by this browser."));
	}
  });
}

export const getIpLocation = async (): Promise<GeolocationPosition> => {
  try {
	const { data } = await axios.get("https://ipinfo.io/json?token=d528a69471b1f2a9ce4d239c07857f2f");
	if (data.loc) {
	  const [latitude, longitude] = data.loc.split(",");
	  return {
		coords: {
		  latitude: parseFloat(latitude),
		  longitude: parseFloat(longitude),
		  accuracy: 100, // Default accuracy
		  altitude: null, // Default to null as it's not available
		  altitudeAccuracy: null, // Default to null as it's not available
		  heading: null, // Default to null as it's not available
		  speed: null, // Default to null as it's not available
		  toJSON: () => ({
			latitude: parseFloat(latitude),
			longitude: parseFloat(longitude),
			accuracy: 100,
			altitude: null,
			altitudeAccuracy: null,
			heading: null,
			speed: null,
		  }),
		},
		timestamp: Date.now(),
	  } as GeolocationPosition;
	} else {
	  throw new Error("Location not found in IP data.");
	}
  } catch (error) {
	console.error("Failed to fetch location from IP API:", error);
	throw new Error("Unable to retrieve location.");
  }
};