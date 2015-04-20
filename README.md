# xmltojsdoc

Convert XML code comments to the JSDoc format

## [Batch converter with drag and drop](http://patik.github.io/xmltojsdoc)

Use **xmltojsdoc** to convert [XML comments](https://msdn.microsoft.com/en-us/library/5ast78ax.aspx) common in C# and .NET to JSDoc-formatted comments.

Before:

```
///<summary>Adds event listeners to a button</summary>
///<param name="elem" type="Element">Button element</param>
///<param name="options" type="Object">Optional settings</param>
///<returns>True if successful, false if unsuccessful</returns>
///<remark>If no `elem` is specified, the first `<button>` on the page will be used</remark>
```

After:

```
/**
 * Adds event listeners to a button
 * 
 * If no `elem` is specified, the first `<button>` on the page will be used
 * 
 * @param   {Element}   elem      Button element
 * @param   {Object}    options   Optional settings
 * @return  {[type]}              True if successful, false if unsuccessful
 */
```
