(function (global, name, definition) {
    // Require
    if (typeof define === 'function' && define.amd) {
        define([], definition);
    }
    // CommonJS
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = name;
    }
    // Fall back to a global variable
    else {
        global[name] = definition();
    }
}(this, 'xmltojsdoc', function () {
    var xmlParser;
    var query = function _query(node, selector) {
        return [].slice.call(node.getElementsByTagName(selector));
    };

    var convert = function _parse(source) {
        var xml = '<comment>\n';
        var descs = [];
        var remarks = [];
        var params = [];
        var ret = [];
        var doc;
        var comment = '/**\n';
        var nameColumnWidth = 0;
        var typeColumnWidth = 0;

        // Convert original comment to simple XML string
        source.split('\n').forEach(function (line) {
            line = line.trim();

            if (!line) { return false; }

            // Remove leading triple-slash
            xml += line.replace(/\/\/\/\s*/, '') + '\n';
        });

        xml += '</comment>';

        // Create crawlable document
        doc = xmlParser(xml);

        // Check for parser errors
        if (doc.getElementsByTagName('parsererror').length) {
            throw new Error(doc.getElementsByTagName('parsererror')[0].textContent
                                    .replace('This page contains the following errors:', 'This page contains the following errors:\n')
                                    .replace(/\n/g, '<br>')
                                    .replace('Below is a rendering of the page up to the first error.', ''));
        }

        /////////////////
        // Gather data //
        /////////////////

        // See https://msdn.microsoft.com/en-us/library/b2s063f7.aspx

        // Get description(s)
        query(doc, 'summary').forEach(function (elem) {
            descs.push(elem.textContent.trim());
        });

        // Make sure there's at least a placeholder
        if (!descs.length) {
            descs.push('[description]');
        }

        // Get remark(s)
        query(doc, 'remark').forEach(function (elem) {
            remarks.push(elem.textContent.trim());
        });

        // Collect arguments
        query(doc, 'param').forEach(function (elem) {
            var param = {
                    name: '[name]',
                    type: '',
                    desc: '[description]'
                };

            if (elem.getAttribute('name')) {
                param.name = elem.getAttribute('name')
                                .trim()
                                .replace(/^DOM\s+/, '');
            }

            if (elem.getAttribute('type')) {
                param.type = elem.getAttribute('type');
            }

            if (elem.textContent.trim()) {
                param.desc = elem.textContent.trim();
            }

            params.push(param);
        });

        // Collect return object
        query(doc, 'returns').forEach(function (elem) {
            var param = {
                    type: '',
                    desc: '[description]'
                };

            if (elem.getAttribute('name')) {
                param.name = elem.getAttribute('name')
                                .trim()
                                .replace(/^DOM\s+/, '');
            }

            if (elem.getAttribute('type')) {
                param.type = elem.getAttribute('type').trim();
            }

            if (elem.textContent.trim()) {
                param.desc = elem.textContent.trim();
            }

            ret.push(param);
        });

        // Determine column widths by finding the length of the longest names and types
        params.concat(ret).forEach(function (param) {
            if (param.type.length > typeColumnWidth) {
                typeColumnWidth = param.type.length;
            }

            if (param.name && param.name.length > nameColumnWidth) {
                nameColumnWidth = param.name.length;
            }
        });

        // Add room for the curly braces and some extra padding
        typeColumnWidth += 4;
        nameColumnWidth += 4;

        //////////////////////////
        // Build comment string //
        //////////////////////////

        // Add description to comment
        comment += ' * ' + descs.join('\n * ') + '\n *\n';

        // Add remarks to comment
        if (remarks.length) {
            comment += ' * ' + remarks.join('\n * ') + '\n *\n';
        }

        // Add params to comment
        params.forEach(function (param) {
            // Add opener and type
            comment += ' * @param   {' + param.type + '}';

            // Add padding to fill out the column
            comment += Array(typeColumnWidth - param.type.length).join(' ');

            // Add name
            comment += param.name;

            // Add padding to fill out the column
            comment += Array(nameColumnWidth - param.name.length).join(' ');

            // Add description
            comment += param.desc;

            comment += '\n';
        });

        // Add returns to comment
        ret.forEach(function (param) {
            // Add opener and type
            comment += ' * @return  {' + param.type + '}';

            // Add padding to fill out the column
            comment += Array(typeColumnWidth - param.type.length).join(' ');

            // Add more padding to take place of the name
            comment += Array(nameColumnWidth).join(' ');

            // Add description
            comment += param.desc;

            comment += '\n';
        });

        comment += ' */';

        return comment;
    };

    // Look for a native XML parser

    // Browser environment
    if (typeof window === 'object') {
        // Get browser's native XML parser
        if (typeof window.DOMParser !== 'undefined') {
            xmlParser = function (xmlStr) {
                return ( new window.DOMParser() ).parseFromString(xmlStr, 'text/xml');
            };
        }
        else if (typeof window.ActiveXObject !== 'undefined' && new window.ActiveXObject('Microsoft.XMLDOM')) {
            xmlParser = function (xmlStr) {
                var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');

                xmlDoc.async = 'false';
                xmlDoc.loadXML(xmlStr);

                return xmlDoc;
            };
        }
    }

    if (!xmlParser) {
        throw new Error('No XML parser found');
    }

    // Parse the comment
    return {
        convert: convert
    }
}));
