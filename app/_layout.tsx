// NO import '../global.css'; ← Remove this line
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Workaround / diagnostic:
  // Some libraries (notably Slot-based components) can end up doing
  // `React.cloneElement(<React.Fragment />, { style: ... })` which triggers:
  // "Invalid prop `style` supplied to `React.Fragment`".
  // Fragments ignore style anyway, so stripping it is safe and removes the toast.
  if (__DEV__) {
    try {
      const origCloneElement = React.cloneElement;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - monkey patch for dev only
      React.cloneElement = function (element: any, props: any, ...children: any[]) {
        if (element?.type === React.Fragment && props && (props.style != null || props.className != null)) {
          // eslint-disable-next-line no-console
          console.warn('DEV DEBUG: stripping invalid props from React.Fragment:', {
            hasStyle: props.style != null,
            hasClassName: props.className != null,
          });
          // eslint-disable-next-line no-console
          console.warn(new Error().stack);
          const { style, className, ...rest } = props;
          return origCloneElement(element, rest, ...children);
        }

        return origCloneElement(element, props, ...children);
      };
    } catch {
      // ignore in case monkey patching fails
    }
  }

  return (
    <AuthProvider>
      <Slot /> 
    </AuthProvider>
  );
}
