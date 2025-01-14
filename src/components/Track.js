import React, { useState, useRef } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { motion, useAnimation  } from "framer-motion";
import pauseBut from '../img/pause-but.svg';
import playBut from '../img/play-but.svg';
import nextBut from '../img/next.svg';
import tickBut from '../img/tick.svg';
//stylesy
import { 
    Cover, 
    ArtTitle, 
    Title, 
    Artist, 
    Controls, 
    HeaderPlaylist, 
    PlaylistName, 
    ControlBar, 
    TrackStyle, 
    MainWrapper, 
    PlayPause, 
    PlayPauseImg,
    TrackNumber,
    TitleWrapper
 } from './styles/TrackStyles';
import { CategoriesHeader } from './styles/mainStyles';
import { BackPara } from './styles/CategoriesStyles';
import backTo from '../img/backTo.svg';
import { Image } from "react-image-and-background-image-fade";
import { usePalette } from 'react-palette';
import { useMediaQuery } from 'react-responsive';

const Track = ({ source, playName, p1, p2, backFunc, linkToTestFunc }) => {

    const [play, setPlay] = useState(true);
    const [trackNumber, setTrackNumber] = useState(0);
    const [bar, setBar] = useState(0);
    const [back, setBack] = useState(false);
    
    const makeAudioFade = (e) => {

        e.target.play();

        const sound = e.target;

        sound.volume = 0;
    
        let fadePoint = sound.duration - 4; 
        let fadePointIn = 4; 

        const fadeAudioIn = setInterval(function () {
    
          if ((sound.currentTime < fadePointIn) && (sound.volume < 0.9)) {
              sound.volume += 0.1;
          }
          if (sound.volume === 1) {
              clearInterval(fadeAudioIn);
          }
        }, 400);
    
        const fadeAudioOut = setInterval(function () {
    
            if ((sound.currentTime >= fadePoint) && (sound.volume > 0.1)) {
                sound.volume -= 0.1;
            }
            if (sound.volume === 0.1) {
                clearInterval(fadeAudioOut);
            }
        }, 500);
    
    };

    const audioRef = useRef(null);

    const handlePlayPause = () => {
        setPlay(play => !play);
        if(play){
            audioRef.current.pause();
        }else{
            audioRef.current.play();
        }
    };

    const playNextTrack = () => {
        if(trackNumber === 4){
            audioRef.current.addEventListener('pause',function() {
                linkToTestFunc(source);
            });
            if(!play){
                linkToTestFunc(source);
            };
            audioRef.current.pause();
        }else{
          setTrackNumber(trackNumber => trackNumber + 1);
          setPlay(true);
          controls.start();
        }
    };

    const controls = useAnimation();

    controls.start({
        x: 0,
        transition: { duration: 0.3 },
    });

    const updateBar = (e) => {
        setBar(parseFloat(e.target.currentTime / e.target.duration).toFixed(2));
    };
    
    const handleBackLink = () => {
        audioRef.current.addEventListener('pause',function() {
            backFunc(source);
        });
        if(!play){
            backFunc(source);
        }
        audioRef.current.pause();
    };

    const isLaptop = useMediaQuery({
        query: '(min-width: 1024px)'
    });

    return(
        <TrackStyle
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
        >

            <CategoriesHeader>

                <div
                    onClick={handleBackLink}
                >
                    {
                        isLaptop ? <BackPara>Back</BackPara> : <img src={backTo} alt="Back" />
                    }
                </div>

                {
                    back && <Redirect to={{ pathname: p1 || "/categories", search: p2 }} />
                }

                <div>
                    <HeaderPlaylist>playing from playlist</HeaderPlaylist>
                    <PlaylistName>{playName}</PlaylistName>
                </div>

                <div></div>

            </CategoriesHeader>
            
            <audio 
                src={source[trackNumber].preview} 
                type="audio/mpeg" 
                onCanPlay={makeAudioFade} 
                ref={audioRef} 
                onPause={()=>setPlay(false)} 
                onPlay={()=>setPlay(true)} 
                onTimeUpdate={(e)=>updateBar(e)} 
                onEnded={playNextTrack} 
            />

            <MainWrapper>

                <CoverWrapper data={source[trackNumber].cover} />

                <ControlBar>

                    <ArtTitle>

                        <TitleWrapper>
                            <Title key={source[trackNumber].name}>{source[trackNumber].name}</Title>
                            <Artist key={'@' + source[trackNumber].artist}>{source[trackNumber].artist}</Artist>
                        </TitleWrapper>

                        {
                            !isLaptop && (

                            <Controls>

                                <PlayPause onClick={handlePlayPause} >
                                    {play ? <PlayPauseImg src={pauseBut} /> : <PlayPauseImg src={playBut} />}
                                </PlayPause>
                            
                                <motion.div onClick={playNextTrack} style={{padding: '20px'}}>
                                    {
                                        (trackNumber === 4) 
                                        ? <PlayPauseImg src={tickBut} />
                                        : <PlayPauseImg src={nextBut} /> 
                                    }
                                </motion.div>

                            </Controls>
                            
                            )

                        }

                    </ArtTitle>
                    
                    <progress id="seekbar" value={bar} max="1"></progress>

                    {
                        isLaptop && (

                            <Controls>

                                <PlayPause onClick={handlePlayPause} >
                                    {play ? <PlayPauseImg src={pauseBut} /> : <PlayPauseImg src={playBut} />}
                                </PlayPause>
                            
                                <motion.div onClick={playNextTrack} style={{padding: '20px'}}>
                                    {
                                        (trackNumber === 4) 
                                        ? <PlayPauseImg src={tickBut} />
                                        : <PlayPauseImg src={nextBut} /> 
                                    }
                                </motion.div>

                            </Controls>

                        )
                    }

                    <TrackNumber>{trackNumber + 1}/5</TrackNumber>

                </ControlBar>
                
            </MainWrapper>            
        
        </TrackStyle>
    );
}

export default withRouter(Track);

const CoverWrapper = ({data}) => {

    const { data: myData, loading, error } = usePalette(data);

    return (
        <Cover 
            tone = {myData.darkVibrant}
        >

            <Image 
                src={data} 
                style={{ backgroundSize: 'cover',backgroundPosition: 'center top' }} 
                width='100%'
                height='100%'
                isResponsive 
                lazyLoad 
            />

        </Cover>
    );
};

