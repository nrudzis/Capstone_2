import { useForm, Controller } from 'react-hook-form'
import { 
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import SwapApi from './api'

function BuySell({ username, setActivePanel, getUser, showToast, onCancel }) {

  const {
    control,
    handleSubmit
  } = useForm({
    symbol: "",
    orderType: "",
    amount: "",
  });

  const onSubmit = async (data) => {
    const result = await SwapApi.marketTransaction(username, data);
    setActivePanel(null);
    if (result.success) {
      await getUser()
      showToast("Market transaction successful!")
    } else {
      showToast(result.error);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{ display: "flex", justifyContent: "flex-start" }}>
            Market Transaction
          </Typography>
          <Controller
            name="symbol"
            control={control}
            placeholder="symbol"
            render={({field, fieldState}) => (
              <TextField
                fullWidth
                sx={{ mt: 2, mb: 1 }}
                size="small"
                id="symbol"
                label="Symbol"
                variant="outlined"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                {...field}
              />
            )}
            rules={{
              required: "A symbol is required",
              maxLength: {
                value: 10,
                message: "Symbols cannot be more than 10 characters"
              }
            }}
          />
          <Controller
            name="orderType"
            control={control}
            placeholder="order type"
            render={({field, fieldState}) => (
              <TextField
                select
                fullWidth
                sx={{ mt: 2, mb: 1 }}
                size="small"
                id="order-type"
                label="Order Type"
                variant="outlined"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                {...field}
              >
                <MenuItem value="buy">Buy</MenuItem>
                <MenuItem value="sell">Sell</MenuItem>
              </TextField>
            )}
            rules={{ required: "An order type is required" }}
          >
          </Controller>
          <Controller
            name="amount"
            control={control}
            placeholder="amount"
            render={({field, fieldState}) => (
              <TextField
                fullWidth
                sx={{ mt: 2, mb: 1 }}
                size="small"
                id="amount"
                label="Amount"
                variant="outlined"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                {...field}
              />
            )}
            rules={{
              required: "An amount is required",
              pattern: {
                value: /^(\d+(\.\d+)?|\.\d+)$/,
                message: "Amounts must follow a format like 100 or 0.005"
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
            Submit
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

export default BuySell;
