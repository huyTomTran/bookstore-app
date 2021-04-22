/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { fontFamily, fontSize, gray1, gray2, gray5 } from './Styles';
import { UserIcon } from './Icons';
import { ChangeEvent, FC, useState, FormEvent } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { useAuth } from './Auth';

const buttonStyle = css`
  border: none;
  font-family: ${fontFamily};
  font-size: ${fontSize};
  padding: 5px 10px;
  background-color: transparent;
  color: ${gray2};
  text-decoration: none;
  cursor: pointer;
  span {
    margin-left: 10px;
  }
  :focus {
    outline-color: ${gray5};
  }
`;

export const Header: FC<RouteComponentProps> = ({ history, location }) => {
  const searchParams = new URLSearchParams(location.search);
  const criteria = searchParams.get('criteria') || '';
  //  create 'search' state to store the search value in
  const [search, setSearch] = useState(criteria);
  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // console.log(e.currentTarget.value);
    setSearch(e.currentTarget.value);
  };
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    history.push(`/search?criteria=${search}`);
  };

  const { isAuthenticated, user, loading } = useAuth();

  return (
    <div
      css={css`
        position: fixed;
        box-sizing: border-box;
        top: 0;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 20px;
        background-color: #fff;
        border-bottom: 1px solid ${gray5};
        box-shadow: 0 3px 7px 0 rgba(110, 112, 114, 0.21);
      `}
    >
      {/* <a
        href="./" */}
      <Link
        to="/"
        // put the styles in a css attribute on an HTML element in what is called a "tagged template literal"
        // A template literal is a string enclosed by backticks ( `` ) that can span multiple lines
        // and can include a JavaScript expression in curly braces, prefixed with a dollar sign ( ${expression} )
        css={css`
          font-size: 24px;
          font-weight: bold;
          color: ${gray1};
          text-decoration: none;
        `}
      >
        Q & A
      </Link>
      {/* </a> */}
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search..."
          //  drive the search box value from the 'search' state
          value={search}
          onChange={handleSearchInputChange}
          css={css`
            box-sizing: border-box;
            font-family: ${fontFamily};
            font-size: ${fontSize};
            padding: 8px 10px;
            border: 1px solid ${gray5};
            border-radius: 3px;
            color: ${gray2};
            background-color: white;
            width: 200px;
            height: 30px;
            :focus {
              outline-color: ${gray5};
            }
          `}
        />
      </form>
      <div>
        {!loading &&
          (isAuthenticated ? (
            <div>
              <span>{user!.name}</span>
              <Link
                to={{ pathname: '/signout', state: { local: true } }}
                css={buttonStyle}
              >
                <UserIcon />
                <span>Sign Out</span>
              </Link>
            </div>
          ) : (
            <Link to="./signin" css={buttonStyle}>
              <UserIcon />
              <span>Sign In / Sign Up</span>
            </Link>
          ))}
      </div>
    </div>
  );
};

//  wrap the component with the withRouter function to get these props passed into it
export const HeaderWithRouter = withRouter(Header);
