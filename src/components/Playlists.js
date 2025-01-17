import React, { useState, useEffect } from 'react';
import '../App.css';
import { motion } from "framer-motion";
import { Redirect, useLocation, useParams, withRouter } from 'react-router-dom';
import backTo from '../img/backTo.svg';
import roll from '../img/roll.svg';
import { useMediaQuery } from 'react-responsive';

//stylesy
import { ScrollDiv, SwitchDiv, CategoriesHeader, BackToButton } from './styles/mainStyles';
import { H1, H5, UL, LI, PlaylistLink, P, RollImg, ImageLoader, BackPara, Loading } from './styles/CategoriesStyles';

const Playlists = (props) => {

    const useQuery = () => {
      return new URLSearchParams(useLocation().search);
    };
    let x = useQuery();
    x = x.get("name");
    let { name } = useParams();
    const [names, setNames] = useState({id: name, name: x});

    const location = useLocation();
    const [plays, setPlays] = useState([]);
    const [error, setError] = useState();
    const [red, setRed] = useState(false);
    const [lastPlay, setLastPlay] = useState("");
    const [shouldIFetch, setShouldIFetch] = useState(true);
    const [randomNumb, setRandomNumb] = useState(null);

    const getRandomPlaylist = () => {
      let min = 0;
      let max = plays.length-1;
      min = Math.ceil(min);
      max = Math.floor(max);
      setRandomNumb(Math.floor(Math.random() * (max - min + 1)) + min);
    };

    const getPlaylists = async() => {
      if(props.authKey.access_token === undefined){
        setRed(true);
        console.log('brak klucza tokena');
        return;
      }
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${props.authKey.access_token}`);

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
        await fetch(`https://api.spotify.com/v1/browse/categories/${names.id}/playlists?limit=50&country=US`, requestOptions)
        .then(response => response.json())
        .then(result => {
          if( result.error === undefined && ( result.playlists.items.length > 4 ) ){
            setPlays(result.playlists.items);
            setError(false);
          }else{
            setError(true);
          }
        });
    };

    useEffect(() => {
      if(names.id !== undefined){
        getPlaylists();
      }
    },[]);

    const isLaptop = useMediaQuery({
      query: '(min-width: 1024px)'
    });

    if(error === true){
      return(
        <SwitchDiv
          initial={{ opacity: 0}}
          animate={{ opacity: 1}}
          exit={{ opacity: 0}}
          transition={{ duration: 0.3 }}
        >
          <Redirect to={{ 
            pathname: `/error/${names.id}`,
            search: `?name=${names.name}`
          }}
          />
        </SwitchDiv>
      )
    }
    if(error === false){
      return(

        <SwitchDiv
          initial={{ opacity: 0}}
          animate={{ opacity: 1}}
          exit={{ opacity: 0}}
          transition={{ duration: 0.3 }}
        >

          {(randomNumb!==null) && (
            <Redirect to={{
              pathname: `/player/${plays[randomNumb].id}`,
              search: `?name=${plays[randomNumb].name}`,
              para1: location.pathname,
              para2: location.search
            }} />
          )}

          {(names === null) && <Redirect to="/" />}
                      
          <CategoriesHeader>

            <BackToButton to='/categories'>
              {
                isLaptop ? <BackPara>Back</BackPara> : <img src={backTo} alt="Back" />
              }
            </BackToButton> 

            <span>
              <H1>{names.name}</H1>
              <H5>Choose or get random</H5>
            </span>

            <motion.div 
              whileTap={{ scale: 0.8 }}
              onClick={() => getRandomPlaylist()}
            >
              <RollImg src={roll} alt="roll"/>
            </motion.div>

          </CategoriesHeader>

          <ScrollDiv>

              { (plays[0] !== null) && (

                <UL>
                  {plays.map((play,idx) => { 
                  
                  return(
                      <LI key={play.id}>
                        
                        <PlaylistLink to={{ 
                          pathname: `/player/${play.id}`,
                          search: `?name=${play.name}`,
                          para1: location.pathname,
                          para2: location.search
                        }}>

                          <ImageLoader 
                            src={play.images[0].url} 
                            width='100%'
                            height='100%'
                            isResponsive 
                            lazyLoad 
                          />

                          <P>{play.name}</P>

                          </PlaylistLink>
                      </LI>
                  ) 
                    })}
                </UL>

              )}

              </ScrollDiv>     
                
        </SwitchDiv>
      );
  }
  else{
    return(
      <Loading>Loading...</Loading>
    );
  }
}

export default withRouter(Playlists);
