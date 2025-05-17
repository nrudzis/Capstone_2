import { useForm, Controller } from 'react-hook-form'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useNavigate, useOutletContext, Link } from 'react-router'
import SwapApi from './api.js'

function Login() {

  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const {
    control,
    handleSubmit
  } = useForm({
    username: "",
    password: "",
  });

  const onSubmit = async (data) => {
    const result = await SwapApi.login(data);
    if (result.success) {
      navigate(`/users/${result.username}`);
      showToast(`Successfully logged in. Welcome, ${result.username}!`);
    } else {
      showToast(result.error);
    }
  };

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div" sx={{ display: "flex", justifyContent: "flex-start" }}>
              Log In
            </Typography>
            <Controller
              name="username"
              control={control}
              placeholder="username"
              render={({field, fieldState}) => (
                <TextField 
                  fullWidth
                  sx={{ mt: 2, mb: 1 }}
                  size="small"
                  id="username"
                  label="Username"
                  variant="outlined"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  {...field}
                />
              )}
              rules={{
                required: "Username is required",
                maxLength: {
                  value: 20,
                  message: "Usernames cannot be more than 20 characters"
                }
              }}
            />
            <Controller
              name="password"
              control={control}
              render={({field, fieldState}) => (
                <TextField 
                  fullWidth
                  sx={{ mt: 2, mb: 1 }}
                  size="small"
                  id="password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  {...field}
                />
              )}
              rules={{
                required: "Password is required",
                maxLength: {
                  value: 20,
                  message: "Password cannot be more than 20 characters"
                }
              }}
            />
          </CardContent>
          <CardActions sx={{ mr: 1, justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              type="submit"
              sx={{ mt: 2, mb: 1 }}
            >
              Log In
            </Button>
          </CardActions>
        </form>
      </Card>
      <br/>
      <p>Don't have an account? Click <Link to="/auth/register">here</Link> to register.</p>
    </>
  )
};

export default Login;
