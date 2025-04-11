import React from 'react'
import { useState, useEffect } from 'react';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

// API STUFF START
const API_KEY = import.meta.env.VITE_API_KEY;

const API_BASE_URL = 'https://api.themoviedb.org/3';


const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

//API STUFF END

const App = () => {
  // Use States
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(``);
  const [searchTerm, setSearchTerm] = useState(``);
  const [movieList, setMovieList] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(``);
  
  const [trendingMovies, setTrendingMovies] = useState([]);


  // Debounce the Search term to prevent making too many API requests
  // By waiting for the user to stop typin for 500ms
  useDebounce(()=> setDebouncedSearchTerm(searchTerm), 500 [setSearchTerm]);

  // API - Application Programming Interface - A set of rules that allows one Software Application to talk to another

  const fetchMovies = async (query = '') => {
    // Isse Pehle ke API kuch kry loading show krwao
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch Movies");
      }

      const data = await response.json();

      if(data.response === false) {
        setErrorMessage(data.Error || "Failed To Fetch Movies");
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.log(`Error fetching movies: ${error}`);
      setErrorMessage(`Error fetching movies. Please try again later.`)
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching Trending Movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  },[])

  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Wihtout The Hassle</h1>
          <Search searchTerm={debouncedSearchTerm} setSearchTerm={setDebouncedSearchTerm} />        
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending</h2>
            <ul>
              {trendingMovies.map((movie, index)=>(
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>

          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}

        </section>
      </div>
    </main>
  )
}

export default App;