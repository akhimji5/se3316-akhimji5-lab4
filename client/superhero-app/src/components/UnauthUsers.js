import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UnAuthUsers.css';
import { useNavigate } from 'react-router-dom';

function UnauthUsers() {
    const [searchInput, setSearchInput] = useState('');
    const [searchField, setSearchField] = useState('name');
    const [nResults, setNResults] = useState(10);
    const [superheroes, setSuperheroes] = useState([]);
    const [publicLists, setPublicLists] = useState([]);
    const [publicListDetails, setPublicListDetails] = useState({});
    const [sortField, setSortField] = useState('name');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPublicLists, setShowPublicLists] = useState(false);
    const [nameSearch, setNameSearch] = useState('');
    const [raceSearch, setRaceSearch] = useState('');
    const [publisherSearch, setPublisherSearch] = useState('');
    const [powerSearch, setPowerSearch] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/list/publicFavoriteLists')
            .then(response => {
                console.log("Public Lists Response:", response.data); // Log the response
                setPublicLists(response.data.map(list => ({ ...list, showDetails: false })));
            })
            .catch(error => {
                console.error('Error fetching public lists:', error);
            });
    }, []);

    const togglePublicListDetails = listName => {
        const updatedPublicLists = publicLists.map(list => {
            if (list.listName === listName) {
                return { ...list, showDetails: !list.showDetails };
            }
            return list;
        });
        setPublicLists(updatedPublicLists);

        const selectedList = updatedPublicLists.find(list => list.listName === listName);
        if (selectedList && selectedList.showDetails && !publicListDetails[listName]) {
            setIsLoading(true);
            Promise.all([
                axios.get(`http://localhost:5000/list/favoriteLists/${listName}/superheroes/info`),
                axios.get(`http://localhost:5000/list/favoriteLists/${listName}/reviews`)
            ])
                .then(([heroesResponse, reviewsResponse]) => {
                    setPublicListDetails({
                        ...publicListDetails,
                        [listName]: {
                            superheroes: heroesResponse.data,
                            reviews: reviewsResponse.data
                        }
                    });
                })
                .catch(error => {
                    console.error(`Error fetching details for list ${listName}:`, error);
                    setError(`Error fetching details for list ${listName}`);
                })
                .finally(() => setIsLoading(false));
        }
    };

    const handleBack = () => {
        navigate('/'); 
    };

    const navigate = useNavigate();

    const toggleShowPublicLists = () => {
        setShowPublicLists(!showPublicLists);
    };

    const searchSuperheroes = () => {
        setIsLoading(true);
        let url = `http://localhost:5000/superhero/search?name=${encodeURIComponent(nameSearch)}&race=${encodeURIComponent(raceSearch)}&publisher=${encodeURIComponent(publisherSearch)}&power=${encodeURIComponent(powerSearch)}`;
        axios.get(url)
            .then(response => {
                return Promise.all(response.data.map(hero =>
                    axios.get(`http://localhost:5000/superhero/getById/${hero.id}`)
                ));
            })
            .then(detailsResponses => {
                setSuperheroes(detailsResponses.map(res => ({
                    ...res.data,
                    showDetails: false
                })));
            })
            .catch(error => {
                console.error('Error during search:', error);
                setError('Error during search');
            })
            .finally(() => setIsLoading(false));
    };


    const toggleHeroDetails = (heroId) => {
        setSuperheroes(superheroes.map(hero => {
            if (hero._id === heroId) {
                return { ...hero, showDetails: !hero.showDetails };
            }
            return hero;
        }));
    };


    const sortSuperheroes = () => {
        const sortedHeroes = [...superheroes].sort((a, b) => {
            switch (sortField) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'power':
                    return b.power - a.power;
                case 'race':
                    return a.Race.localeCompare(b.Race);
                case 'publisher':
                    return a.Publisher.localeCompare(b.Publisher);
                default:
                    return 0;
            }
        });
        setSuperheroes(sortedHeroes);
    };

    
    const renderSuperheroes = () => {
        return superheroes.map(hero => (
            <div className="hero" key={hero._id}>
                <div className="hero-name">{hero.name}</div>
                <div className="hero-publisher">Publisher: {hero.publisher}</div>
                <button className="toggle-details-btn" onClick={() => toggleHeroDetails(hero._id)}>
                    {hero.showDetails ? 'Hide Details' : 'Show Details'}
                </button>
                {hero.showDetails && (
                    <div className={`hero-details ${hero.showDetails ? 'show' : ''}`}>
                        <div>ID: {hero.id}</div>
                        <div>Gender: {hero.gender}</div>
                        <div>Eye color: {hero.eyeColor}</div>
                        <div>Race: {hero.race}</div>
                        <div>Hair color: {hero.hairColor}</div>
                        <div>Height: {hero.height} cm</div>
                        <div>Skin color: {hero.skinColor}</div>
                        <div>Alignment: {hero.alignment}</div>
                        <div>Weight: {hero.weight} kg</div>
                        <div>Powers: {Array.isArray(hero.powers) ? hero.powers.join(', ') : hero.powers}</div>
                        <a href={`https://duckduckgo.com/?q=${encodeURIComponent(hero.name)}&ia=web`} target="_blank" rel="noopener noreferrer">
                            DuckDuckGo
                        </a>
                    </div>
                )}
            </div>
        ));
    };


    const clearSearchResults = () => {
        setSuperheroes([]);
        setError('');
        setSearchInput('');
    };

    const renderPublicLists = () => {
        console.log("Current state of publicListDetails:", publicListDetails); 
        return publicLists.map(list => (
            <div key={list.listName} className="public-list">
                <h3>List: <br></br>{list.listName}</h3>
                <p className="creator">Created By: {list.userName}</p>
                <p className="created-at">Created At: {new Date(list.createdAt).toLocaleString()}</p>
                <p className="last-updated">Last Updated: {new Date(list.updatedAt).toLocaleString()}</p>
                <button onClick={() => togglePublicListDetails(list.listName)}>
                    {list.showDetails ? 'Hide Details' : 'Show Details'}
                </button>
                {list.showDetails && publicListDetails[list.listName] && (
                    <div className="hero-finder-container">
                        {publicListDetails[list.listName].superheroes && publicListDetails[list.listName].superheroes.map(hero => (
                            <div key={hero._id} className="hero">
                                <div className="hero-name">{hero.name}</div>
                                <div className="hero-publisher">Publisher: {hero.publisher}</div>
                                <div className={`hero-details ${hero.showDetails ? 'show' : ''}`}>
                                    <div>ID: {hero.id}</div>
                                    <div>Gender: {hero.gender}</div>
                                    <div>Eye color: {hero.eyeColor}</div>
                                    <div>Race: {hero.race}</div>
                                    <div>Hair color: {hero.hairColor}</div>
                                    <div>Height: {hero.height} cm</div>
                                    <div>Skin color: {hero.skinColor}</div>
                                    <div>Alignment: {hero.alignment}</div>
                                    <div>Weight: {hero.weight} kg</div>
                                    <div>Powers: {Array.isArray(hero.powers) ? hero.powers.join(', ') : hero.powers}</div>
                                    
                                    <a href={`https://duckduckgo.com/?q=${encodeURIComponent(hero.name)}&ia=web`} target="_blank" rel="noopener noreferrer">
                                        DuckDuckGo
                                    </a>
                                </div>
                                <button
                                    className="toggle-details-btn"
                                    onClick={() => toggleHeroDetailsInList(hero._id, list.listName)}>
                                    {hero.showDetails ? 'Hide Details' : 'Show Details'}
                                </button>

                            </div>
                        ))}
                        <div className="list-reviews">
                            <h4>Reviews:</h4>
                            {publicListDetails[list.listName].reviews && publicListDetails[list.listName].reviews.map((review, index) => (
                                <div key={index} className="review">
                                    <p><strong>{review.reviewerName}</strong>: {review.comment} ({review.rating}/5)</p>
                                    <p>Reviewed on: {new Date(review.createdAt).toLocaleString()}</p>
                                </div>
                            ))}
                
                            <div className="average-rating">
                                {calculateAverageRating(publicListDetails[list.listName].reviews)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ));
    };

    const calculateAverageRating = (reviews) => {
        if (reviews.length === 0) return <p>No ratings yet</p>;

        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        return <p>Average Rating: {averageRating.toFixed(1)} / 5</p>;
    };

    const toggleHeroDetailsInList = (heroId, listName) => {
        if (publicListDetails[listName] && Array.isArray(publicListDetails[listName].superheroes)) {
            setPublicListDetails({
                ...publicListDetails,
                [listName]: {
                    ...publicListDetails[listName],
                    superheroes: publicListDetails[listName].superheroes.map(hero => {
                        if (hero._id === heroId) {
                            return { ...hero, showDetails: !hero.showDetails };
                        }
                        return hero;
                    })
                }
            });
        }
    };


    return (
        <div>
            <button onClick={handleBack} className="back-button">Back</button>
            <div className="search-section">
                <p></p>
                <input type="text" value={nameSearch} onChange={e => setNameSearch(e.target.value)} placeholder="Search by Name" />
                <input type="text" value={raceSearch} onChange={e => setRaceSearch(e.target.value)} placeholder="Search by Race" />
                <input type="text" value={publisherSearch} onChange={e => setPublisherSearch(e.target.value)} placeholder="Search by Publisher" />
                <input type="text" value={powerSearch} onChange={e => setPowerSearch(e.target.value)} placeholder="Search by Power" />
                <p></p>
                <button className="search-button" onClick={searchSuperheroes}>Search</button>
                <button className="search-button" onClick={clearSearchResults}>Clear Search Results</button>
                <p></p>
            </div>

            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <div>
                <h3>Superheroes Search Results:</h3>
                {renderSuperheroes()}
            </div>

            <p></p>
            <button onClick={toggleShowPublicLists}>
                {showPublicLists ? 'Hide Public Lists' : 'Show Public Lists'}
            </button>

            {showPublicLists && (
                <div>
                    <h3>Public Superhero Lists:</h3>
                    {renderPublicLists()}
                </div>
            )}
        </div>
    );
}

export default UnauthUsers;
