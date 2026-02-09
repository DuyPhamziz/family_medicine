import {NavLink} from 'react-router-dom';

const NavItem = ({label, to, exact}) => {
    return (
        <NavLink
            to={to}
            exact={exact}
            className={({isActive}) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
                }`
            }
        >
            {label}
        </NavLink>
    );
};

export default NavItem;