const Formatters = {
    toCurrency: (amount) => {
        if (amount === null || amount === undefined) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2
        }).format(amount);
    },
    toDate: (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    }
};