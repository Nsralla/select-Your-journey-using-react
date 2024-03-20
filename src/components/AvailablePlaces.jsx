import { useState } from 'react';
import Places from './Places.jsx';
import { useEffect } from 'react';
import Error from '../components/Error.jsx'
import {sortPlacesByDistance} from '../loc.js'
import { fetchAvailablePlaces } from '../http.js';


export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setisFetching]  = useState(false);
  const [error, setError] = useState();

  useEffect(()=>{
      async function fetchPlaces(){
        setisFetching(true);
        try{
            const places = await fetchAvailablePlaces();
            // fetch user location
            // navigator.geolocation.getCurrentPosition((position)=>{
            //   const sortedPlaces = sortPlacesByDistance(
            //     places,
            //     position.coords.latitude,
            //     position.coords.longitude
            //   );
            //   setAvailablePlaces(sortedPlaces);
            //   setisFetching(false);
            // });
                setAvailablePlaces(places);
                setisFetching(false);
          
        }
        catch(error){
          setError({
            message:error.message
            ||
            'Could not fetch Places, please try again'
          });
          setisFetching(false);
        }
      
      }
      fetchPlaces();
    },[]);


    if(error){
      return <Error title="An error occured" message={error.message}></Error>
    }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      fallbackText="No places available."
      loadingText='Fetching places data....'
      isLoading={isFetching}
      onSelectPlace={onSelectPlace}
    />
  );

}
