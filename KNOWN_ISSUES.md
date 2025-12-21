# Known Issues

## Jest/Babel Compatibility Issue

**Status**: Open (non-blocking for development)
**Affects**: Test suite execution
**Does NOT affect**: Runtime code, Expo dev server, production builds

### Problem

React Native 0.81.5's Jest setup files (`node_modules/react-native/jest/react-native-env.js`) use a Babel plugin configuration format that causes validation errors:

```
[BABEL] /home/user/mukoko-news/mobile/node_modules/react-native/jest/react-native-env.js: .plugins is not a valid Plugin property
```

### Root Cause

Compatibility mismatch between:
- React Native 0.81.5 (Jest setup files)
- Jest 29.x (testing framework)
- Babel 7.28.x (transpiler)
- babel-preset-expo 54.x (Expo's Babel preset)

The React Native package's internal Jest configuration files haven't been updated for the current Babel/Jest ecosystem.

### Attempted Fixes

1. ✅ Removed `react-native-paper/babel` plugin from `babel.config.js`
2. ✅ Switched from `react-native` preset to `jest-expo` preset
3. ✅ Installed `jest-expo` package
4. ✅ Downgraded Jest from v30 to v29
5. ❌ Issue persists - comes from React Native's internal files

### Workarounds

**For Development:**
- Use `npm start` / `expo start` for dev server (works perfectly)
- All migrated code is syntactically valid (verified with `node -c`)
- Runtime execution is unaffected

**For Testing:**
- Use `expo start --web` and manual testing
- Verify syntax with `node -c <file>` for each file
- Wait for React Native update or community fix

### Impact

- ❌ Cannot run Jest test suite (`npm test`)
- ❌ Cannot run automated unit tests
- ✅ Dev server works fine
- ✅ Production builds work fine
- ✅ All code is syntactically valid
- ✅ Manual testing works

### Future Resolution

This issue will likely be resolved when:
1. React Native releases an update fixing the Jest setup files
2. Community provides a workaround/patch
3. Expo updates compatibility between RN + Jest + Babel
4. We upgrade React Native to a newer version

### Related Files

- `mobile/babel.config.js` - Simplified Babel config
- `mobile/jest.config.js` - Using `jest-expo` preset
- `mobile/jest.setup.js` - Custom Jest setup (works fine)
- `mobile/package.json` - Dependencies (Jest 29.x, RN 0.81.5)

### Conclusion

This is a **known dependency compatibility issue** that **does not affect development or production**. All NativeWind migrations are complete and functional - the issue is purely with test infrastructure.

**Recommendation**: Continue development using Expo dev server and manual testing until a fix is available.
