import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { fetchUserPlaces, updateUserPlaces } from './http.js';
import Error from './components/Error.jsx';

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [errorUpdaintgPlaces, seterrorUpdaintgPlaces] = useState();

    const [isFetching, setisFetching] = useState(false);
    const [error, setError] = useState();


  // fetch user places
  useEffect(()=>{
    async function fetch_user_places(){
      try{
          setisFetching(true);
          const response = await fetchUserPlaces();
          setUserPlaces(response);
      }
      catch(error){
        setError({message: 'Failed Fetching user places'});
      }

      setisFetching(false);
      
    }
    fetch_user_places();
  },[]);





  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces; // if the place already chosen
      }
      return [selectedPlace, ...prevPickedPlaces]; // add the selected place
    });

    // post data to database
    try{
      await updateUserPlaces([...userPlaces, selectedPlace]); // this method is used and not directly the new data, because the new data won't be updated directly until it turns come at the queue
    } 
    catch(error){
      setUserPlaces(userPlaces); // if error happend sending data to database, reput the old user places
      seterrorUpdaintgPlaces({message:  'failed to update places'});
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try{
      // send HTTPS request to delete deleted place
      await updateUserPlaces(
        userPlaces.filter((place) => {
          return place.id !== selectedPlace.current.id;
        })
      );
    }
    catch(error){ // if error happend sending data to database, roll back to the old data before deleting
      setUserPlaces(userPlaces);
      seterrorUpdaintgPlaces({message: 'Failed to delete places'});
    }


    setModalIsOpen(false);
  }, [userPlaces]);


  function handleError(){
    seterrorUpdaintgPlaces(null);
  }


  return (
    <>
      <Modal open={errorUpdaintgPlaces}>
        {errorUpdaintgPlaces && <Error
          title="An error occured"
          message={errorUpdaintgPlaces.message}
          onConfirm={handleError}
        ></Error>}
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occured" message={error.message}></Error>}
        {!error && (<Places
          title="I'd like to visit ..."
          isLoading={isFetching}
          loadingText="Fetching your places"
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />)}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
