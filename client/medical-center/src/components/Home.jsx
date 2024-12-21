// src/components/Home.jsx

import React from 'react';
import { Typography, Box } from '@mui/material';

function Home() {
    return (
        <Box className="mt-5">
            <Typography variant="h4" gutterBottom>
                Добро пожаловать в Медицинское Приложение
            </Typography>
            <Typography variant="body1">
                Используйте меню выше для регистрации, входа или управления отделениями.
            </Typography>
        </Box>
    );
}

export default Home;
