// utils/withAdminGuard.js
export const withAdminGuard = (Component) => {
  return (props) => {
    const token = localStorage.getItem('token');
    const decoded = token ? JSON.parse(atob(token.split('.')[1])) : {};
    if (decoded.role !== 'admin') {
      window.location.href = '/login';
      return null;
    }
    return <Component {...props} />;
  };
};
