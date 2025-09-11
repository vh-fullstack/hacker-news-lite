import { Link } from 'react-router-dom'

import PropTypes from 'prop-types';

const Blog = ({ blog, index }) => {

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    borderWidth: 1,
    marginBottom: -5,
  };

  return (
    <div  className="blog" style={blogStyle}>
      <div style={{ ...blogStyle, textAlign: 'left' }} className="blogTitleAuthor">
        <span>{index + 1}. </span>
        <Link to={`/blogs/${blog.id}`}>
          {blog.title}
        </Link>
        {' '}
        <a href={blog.url} target="_blank" rel="noopener noreferrer" style={{ color: '#888', fontSize: '0.9em' }}>
          ({blog.url})
        </a>
        <div style={{ color: '#888', fontSize: '0.9em' }}>{blog.comments.length} comments | posted by {blog.user.username}</div>
      </div>
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
};

export default Blog;
