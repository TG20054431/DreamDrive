module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Devi effettuare l\'accesso per accedere a questa pagina');
        res.redirect('/auth/login');
    }
};