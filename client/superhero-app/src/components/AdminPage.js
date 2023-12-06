import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UnAuthUsers.css'; 
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [listName, setListName] = useState('');
    const [reviewId, setReviewId] = useState('');
    const navigate = useNavigate(); 
    const [userId, setUserId] = useState('')
    const [showUserList, setShowUserList] = useState(false);
    const [publicLists, setPublicLists] = useState([]);
    const [publicListDetails, setPublicListDetails] = useState({});
    const [showPublicLists, setShowPublicLists] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('userId')) {
            navigate('/signin');
        }

        fetchUsers();
        fetchPublicLists();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/user/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchPublicLists = async () => {
        try {
            const response = await axios.get('http://localhost:5000/list/publicFavoriteLists');
            setPublicLists(response.data.map(list => ({ ...list, showDetails: false })));
        } catch (error) {
            console.error('Error fetching public lists:', error);
        }
    };

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
                axios.get(`http://localhost:5000/list/favoriteLists/${listName}/reviews/admin`)
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

    const calculateAverageRating = (reviews) => {
        if (reviews.length === 0) return <p>No ratings yet</p>;

        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        return <p>Average Rating: {averageRating.toFixed(1)} / 5</p>;
    };

    const renderPublicLists = () => {
        return publicLists.map(list => (
            <div key={list.listName} className="public-list">
                <h3 className="list-name">{list.listName}</h3>
                <p className="creator">Created by: {list.userName}</p>
                <p className="created-at">Created at: {new Date(list.createdAt).toLocaleString()}</p>
                <p className="last-updated">Last updated: {new Date(list.updatedAt).toLocaleString()}</p>
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
                                    <p>Review ID: {review._id}</p>
                                    <p>Status: {review.hidden ? 'Hidden' : 'Visible'}</p>
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

    const handleLogout = () => {
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        navigate('/signin');
    };

    const navigateToHeroFinder = () => {
        navigate('/herofinder');
    };

    const toggleShowPublicLists = () => {
        setShowPublicLists(!showPublicLists);
    };

    const handleToggleUserDisabled = async (userId) => {
        const adminUserId = localStorage.getItem('userId');
        try {
            const response = await axios.post(`http://localhost:5000/user/toggleDisable/${userId}`, {
                userId: adminUserId
            });
            alert('User disabled/enabled status updated');
            setUsers(users.map(user => {
                if (user.id === userId) {
                    return { ...user, isDisabled: !user.isDisabled };
                }
                return user;
            }));
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating user status');
        }
    };

    const handleGrantManagerPrivileges = async (userId) => {
        const adminUserId = localStorage.getItem('userId');
        try {
            const response = await axios.post(`http://localhost:5000/user/makeAdmin/${userId}`, {
                userId: adminUserId
            });
            alert('Admin privileges granted');
        } catch (error) {
            console.error('Error:', error);
            alert('Error granting Admin privileges');
        }
    };

    const handleHideReview = async () => {
        const adminUserId = localStorage.getItem('userId');
        try {
            const response = await axios.post(`http://localhost:5000/list/favoriteLists/${listName}/reviews/${reviewId}/toggle`, {
                userId: adminUserId
            });
            alert('Review visibility updated');
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating review visibility');
        }
    };

    const toggleShowUserList = () => {
        setShowUserList(!showUserList);
    };

    return (
        <div>
            <h1>Admin Page</h1>
            <button onClick={handleLogout} className="logout-button">Log Out</button>
            <button onClick={navigateToHeroFinder} className="normal-user-button">Normal User Experience</button>
            <button onClick={toggleShowUserList}>Toggle User List</button>
            <div style={{ display: showUserList ? 'block' : 'none' }}>
                <h2>User List</h2>
                {users.map((user) => (
                    <div key={user.id} className="user-container">
                        <p className="user-detail"><strong>Name:</strong> {user.name}</p>
                        <p className="user-detail"><strong>Email:</strong> {user.email}</p>
                        <p className="user-detail"><strong>ID:</strong> {user.id}</p>
                        <p className="user-detail"><strong>Admin Status:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
                        <p className="user-detail"><strong>Disabled Status:</strong> {user.isDisabled ? 'Yes' : 'No'}</p>
                        <div className="user-actions">
                            <button onClick={() => handleToggleUserDisabled(user.id)}>
                                {user.isDisabled ? 'Enable' : 'Disable'}
                            </button>
                            <button onClick={() => handleGrantManagerPrivileges(user.id)}>
                                Grant Admin Privileges
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div>
                <h2>Hide/Unhide Review</h2>
                <input value={listName} onChange={e => setListName(e.target.value)} placeholder="List Name" />
                <input value={reviewId} onChange={e => setReviewId(e.target.value)} placeholder="Review ID" />
                <button onClick={handleHideReview}>Toggle Review Visibility</button>
            </div>
            <p></p>
            <button onClick={toggleShowPublicLists}>
                {showPublicLists ? 'Hide Public Lists' : 'Show Public Lists'}
            </button>
            {showPublicLists && (
                <div>
                    <h2>Public Superhero Lists:</h2>
                    {renderPublicLists()}
                </div>
            )}
        </div>
    );
}

export default AdminPage;