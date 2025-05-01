import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Fetch user details
export const fetchUser = createAsyncThunk("user/fetchDetails", async (data) => {
    const response = await fetch(`http://localhost:3000/api/user/getUser/${data}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    });
    console.log('Reached')
    const user = await response.json();
    console.log("User Details (userSlice): ", user);
    return user;
});

// Post new user
export const postUser = createAsyncThunk("user/postUser", async (data) => {
    const response = await fetch(`http://localhost:3000/api/user/createUser`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
    });
    const user = await response.json();
    return user;
});

// Put (update) user
export const updateUser = createAsyncThunk("user/updateUser", async (data) => {
    const response = await fetch(`http://localhost:3000/api/user/updateUser/${data.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
    });
    const user = await response.json();
    return user;
});

// Delete user
export const deleteUser = createAsyncThunk("user/deleteUser", async (id) => {
    const response = await fetch(`http://localhost:3000/api/user/deleteUser/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return id;
});

export const userSlice = createSlice({
    name: "user",
    initialState: {
        user: {},
        loading: false,
        error: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })
            .addCase(postUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(postUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(postUser.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.user = {};
                state.loading = false;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            });
    },
});

export default userSlice.reducer;
export const {} = userSlice.actions;
