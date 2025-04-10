
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Tab, Nav } from 'react-bootstrap';
import dummyImage from './dummy.png';
import colorSharp2 from '../assets/img/color-sharp2.png';
import 'animate.css';
import TrackVisibility from 'react-on-screen';

export const Projects = () => {
  const [news, setNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('business');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

  useEffect(() => {
    // Fetch news data from your backend server
    setLoading(true);
    axios.get('https://news-aggregator-and-summarizer.onrender.com/api/news')
      .then(response => {
        console.log('News data received:', response.data);
        setNews(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching news:', error);
        setError('Error fetching news. Please try again later.');
        setLoading(false);
      });
  }, []);

  // Function to filter news by selected category
  const getNewsByCategory = (category) => {
    return news.filter(article => article.category === category);
  };

  return (
    <section className="project" id="projects">
      <Container>
        <Row>
          <Col size={12}>
            <TrackVisibility>
              {({ isVisible }) => (
                <div className={isVisible ? 'animate__animated animate__fadeIn' : ''}>
                  <h2>News</h2>
                  <p>
                    Our AI-powered news aggregator brings you the latest headlines, curated just for you. From breaking
                    news to in-depth analysis, TextCraft delivers the stories that matter most.
                  </p>
                  
                  {loading ? (
                    <div className="text-center py-5">Loading news articles...</div>
                  ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                  ) : (
                    <Tab.Container id="projects-tabs" activeKey={selectedCategory} onSelect={(key) => setSelectedCategory(key)}>
                      <Nav
                        variant="pills"
                        className="nav-pills mb-5 justify-content-center align-items-center"
                        id="pills-tab"
                      >
                        {categories.map((category, index) => (
                          <Nav.Item key={index}>
                            <Nav.Link eventKey={category.toLowerCase()}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Nav.Link>
                          </Nav.Item>
                        ))}
                      </Nav>
                      <Tab.Content id="slideInUp" className={isVisible ? 'animate__animated animate__slideInUp' : ''}>
                        {categories.map((category, index) => (
                          <Tab.Pane key={index} eventKey={category.toLowerCase()}>
                            <Row>
                              {getNewsByCategory(category).length > 0 ? (
                                getNewsByCategory(category).map((article, articleIndex) => (
                                  <Col key={articleIndex} size={12} sm={6} md={4} className="mb-4">
                                    <div className="proj-imgbx">
                                      <img 
                                        src={article.imageUrl || dummyImage} 
                                        alt={article.title || "News article"}
                                        onError={(e) => {
                                          console.log("Image failed to load for:", article.title);
                                          e.target.src = dummyImage;
                                        }}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                      />
                                      <a
                                        href={article.url}
                                        style={{ color: 'white', textDecoration: 'none' }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <div className="proj-txtx" style={{ padding: '20px' }}>
                                          <h6>{article.title}</h6>
                                          <p>{article.description && article.description.substring(0, 100)}...</p>
                                        </div>
                                      </a>
                                    </div>
                                  </Col>
                                ))
                              ) : (
                                <Col size={12}>
                                  <div className="text-center py-5">No articles available for {category}</div>
                                </Col>
                              )}
                            </Row>
                          </Tab.Pane>
                        ))}
                      </Tab.Content>
                    </Tab.Container>
                  )}
                </div>
              )}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
      <img className="background-image-right" src={colorSharp2} alt="background" />
    </section>
  );
};
