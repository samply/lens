# Toast Notifications

The `<lens-toast>` component provides user notifications to inform about success or failure states. It supports two types of toasts: error notifications for failures and info notifications for successful operations. Backend components use this system to communicate status changes to users.

The component automatically renders all toasts from the global toast store and handles their lifecycle.

## Usage

```html
<lens-toast></lens-toast>
```

Import the toast functions and show notifications:

```javascript
<<<<<<< Updated upstream
import { showToast, LensToastTyp } from "./toast";
=======
import { showToast, LensToastTyp } from './toast';
>>>>>>> Stashed changes

// Show error notification
showToast("Something went wrong!", LensToastTyp.ERROR);
```

## API Reference

### Types

```typescript
enum LensToastTyp {
<<<<<<< Updated upstream
    ERROR, // Red error notification
    INFO, // Blue info notification
}
=======
    ERROR,  // Red error notification
    INFO    // Blue info notification
}

>>>>>>> Stashed changes
```

## Styling

The component uses CSS parts for customization:

<<<<<<< Updated upstream
| Part name | Description |
| --------------------------- | --------------------------------------- |
| `lens-toast` | Fixed container for the toast stack |
| `lens-toast-flex-container` | Main flexbox container for toast layout |
| `lens-toast-error` | Error toast styling (red theme) |
| `lens-toast-info` | Info toast styling (blue theme) |
| `lens-toast-message` | Text content styling |
| `lens-toast-close-button` | Close button styling |
=======
| Part name | Description |
| --------- | ----------- |
| `lens-toast` | Fixed container for the toast stack |
| `lens-toast-flex-container` | Main flexbox container for toast layout |
| `lens-toast-error` | Error toast styling (red theme) |
| `lens-toast-info` | Info toast styling (blue theme) |
| `lens-toast-message` | Text content styling |
| `lens-toast-close-button` | Close button styling |

> > > > > > > Stashed changes
