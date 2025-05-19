import { useForm, Controller } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button
} from '@mui/material'
import SwapApi from './api'

function SendFunds({ username, setActivePanel, getUser, showToast, onCancel }) {

  const {
    control,
    handleSubmit
  } = useForm({
    usernameReceiving: "",
    amount: "",
  });

  const onSubmit = async (data) => {
    const result = await SwapApi.sendFunds(username, data);
    setActivePanel(null);
    if (result.success) {
      await getUser();
      showToast("Funds successfully sent!");
    } else {
      showToast(result.error);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{ display: "flex", justifyContent: "flex-start" }}>
            Send Funds
          </Typography>
          <Controller
            name="usernameReceiving"
            control={control}
            placeholder="username"
            render={({field, fieldState}) => (
              <TextField
                fullWidth
                sx={{ mt: 2, mb: 1 }}
                size="small"
                id="usernameReceiving"
                label="Recipient username"
                variant="outlined"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                {...field}
              />
            )}
            rules={{
              required: "A recipient username is required",
              maxLength: {
                value: 20,
                message: "Usernames cannot be more than 20 characters"
              }
            }}
          />
          <Controller
            name="amount"
            control={control}
            placeholder="0.00"
            render={({field, fieldState}) => (
              <TextField
                fullWidth
                sx={{ mt: 2, mb: 1 }}
                size="small"
                id="amount"
                label="Amount $"
                variant="outlined"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                {...field}
              />
            )}
            rules={{
              required: "An amount is required",
              pattern: {
                value: /^(\d+(\.\d{1,2})?|\.\d{1,2})$/,
                message: "Amounts must follow a format like 10 or 10.00"
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
            Send Funds
          </Button>
          <Button
            variant="contained"
            type="button"
            sx={{ mt: 2, mb: 1 }}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default SendFunds;
