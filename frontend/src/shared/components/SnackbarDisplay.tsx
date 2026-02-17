import { useContext } from "react";
import {
  Snackbar,
  Alert,
  Stack,
  IconButton,
  Slide,
  type SlideProps,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { SnackbarContext } from "../context/SnackbarContext";

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const SnackbarDisplay = () => {
  const context = useContext(SnackbarContext);

  if (!context) return null;

  const { messages, removeSnackbar } = context;

  return (
    <Stack
      spacing={1}
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 10000,
        pointerEvents: "none",
      }}
    >
      {messages.map((msg) => (
        <Snackbar
          key={msg.id}
          open={true}
          autoHideDuration={msg.duration}
          onClose={() => removeSnackbar(msg.id)}
          TransitionComponent={SlideTransition}
          sx={{ pointerEvents: "auto" }}
        >
          <Alert
            onClose={() => removeSnackbar(msg.id)}
            severity={msg.severity}
            variant="filled"
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={() => removeSnackbar(msg.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {msg.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};
