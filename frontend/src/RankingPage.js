import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, Dropdown, Button, Menu, Drawer, Input, Typography, Row, Col, message } from 'antd';
import { DownOutlined, FallOutlined, SearchOutlined } from '@ant-design/icons';
import { useDebounce } from '@react-hook/debounce';

import MoviePage from './MoviePage';
import BoxCard from './BoxCard';

import './RankingPage.css';

const { Title } = Typography;
const DEBOUNCE_TIME = 400;
const dummyList = [];
for (let i = 0; i < 30; i ++) {
  dummyList.push({id: i});
}

const sortMethods = [
  {name: 'Rating', fun: (a, b) => b.rating - a.rating},
  {name: 'Popularity', fun: (a, b) => b.count - a.count},
  {name: 'Date', fun: (a, b) => b.year - a.year}
]

const DEFAULT_SORTING = 0;

function RankingPage () {
  const [loading, setLoading] = useState(false);
  const [movieList, setMovieList] = useState([]); // list for sorting
  const [seletedSorting, setSeletedSorting] = useState(DEFAULT_SORTING);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [search, setSearch] = useDebounce(null, DEBOUNCE_TIME);

  // get movies when component mounted 
  useEffect(() => {
    async function getMovies() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/movies`);
        const list = res.data; 
        
        list.sort(sortMethods[DEFAULT_SORTING].fun);
        setMovieList(list);
      } catch(err) {
        message.error(err);
      }
      setLoading(false);
    }

    getMovies();
  }, []);

  function handleMenuClick(e) {
    setSeletedSorting(e.key);
    movieList.sort(sortMethods[e.key].fun)
    setMovieList([...movieList])
  };

  // drawer
  function onClickCard(item) {
    setSelectedMovie(item);
  };

  // close and reset selectedMovie
  function onCloseDrawer(){
    setSelectedMovie(null);
  };

  function updateMovie(movie) {
    const newList = movieList.map(m => m.id === movie.id ? movie : m);
    setMovieList(newList);
  };

  const onSearch = (e) => {
    setSearch(e.target.value);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key={0} icon={<FallOutlined />}>
        rating
      </Menu.Item>
      <Menu.Item key={1} icon={<FallOutlined />}>
        polularity
      </Menu.Item>
      <Menu.Item key={2} icon={<FallOutlined />}>
        publish date
      </Menu.Item>
    </Menu>
  );

  let renderList = movieList;
  if (search) {
    renderList = movieList.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
  }

  return(
    <div className="movie-list-content">
      <div className="ranking-layout-content">
        <div className="top-bar">
          <Row gutter={[10, 8]} align="middle">
            <Col xs={24} md={6}>
              <Input size="large" placeholder="input movie title" onChange={onSearch} prefix={<SearchOutlined />} />
            </Col>
            <Col xs={24} md={6}>
              <Dropdown overlay={menu}>
                <Button>
                  Sort by {sortMethods[seletedSorting].name} <DownOutlined />
                </Button>
              </Dropdown>
            </Col>
          </Row>
        </div> 
        <List
          grid={{
            gutter: [16, 20],
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5,
            xxl: 5,
          }}
          dataSource={loading ? dummyList : renderList}
          rowKey='id'
          renderItem={item => (
            <List.Item>
              <div onClick={() => onClickCard(item)}>
                <BoxCard movie={item} loading={loading} />
              </div>
            </List.Item>
          )}
        />
      </div>
      <Drawer
        title={selectedMovie === null ? "Title" : <Title level={2}>{selectedMovie.title}</Title>}
        width={null}
        placement="right"
        closable={false}
        onClose={onCloseDrawer}
        visible={selectedMovie === null ? false : true}
      >
        {selectedMovie !== null && <MoviePage movie={selectedMovie} updateMovie={updateMovie} />}
      </Drawer>
    </div>
  );
};

export default RankingPage;