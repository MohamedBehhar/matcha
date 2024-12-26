import axios from 'axios';


const getImages = async (query: string) => {
	console.log(process.env.REACT_APP_PEXELS_API_KEY);
	  try {
	const response = await axios.get(
	  `https://api.pexels.com/v1/search?query=${query}&per_page=15`,
	  {
		headers: {
		  Authorization: process.env.REACT_APP_PEXELS_API_KEY,
		},
	}
	);

	return response.data.photos;
  } catch (error) {
	throw error;
  }
}

export { getImages };