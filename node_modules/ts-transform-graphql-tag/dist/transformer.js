"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const graphql_tag_1 = require("graphql-tag");
const astify_1 = require("./astify");
const GRAPHQL_TAG_MODULE_REGEX = /^['"]graphql-tag['"]$/;
function getVisitor(context, sourceFile) {
    // `interpolations` as GLOBAL per SourceFile
    let INTERPOLATIONS;
    function collectTemplateInterpolations(node, interpolations, context) {
        if (ts.isTemplateSpan(node)) {
            const interpolation = node.getChildAt(0);
            if (!ts.isIdentifier(interpolation) && !ts.isPropertyAccessExpression(interpolation)) {
                throw new Error("Only identifiers or property access expressions are allowed by this transformer as an interpolation in a GraphQL template literal.");
            }
            interpolations.push(interpolation);
        }
        return ts.visitEachChild(node, childNode => collectTemplateInterpolations(childNode, interpolations, context), context);
    }
    const visitor = (node) => {
        // `graphql-tag` import declaration detected
        if (ts.isImportDeclaration(node)) {
            const moduleName = node.moduleSpecifier.getText(sourceFile);
            if (GRAPHQL_TAG_MODULE_REGEX.test(moduleName)) {
                // delete it
                return undefined;
            }
        }
        // tagged template expression detected
        if (ts.isTaggedTemplateExpression(node)) {
            const [tag, template] = node.getChildren();
            const isTemplateExpression = ts.isTemplateExpression(template);
            const isTemplateLiteral = ts.isNoSubstitutionTemplateLiteral(template);
            if (tag.getText() === "gql" && (isTemplateExpression || isTemplateLiteral)) {
                // init interpolation
                INTERPOLATIONS = [];
                // remove backticks
                let source = template.getText().slice(1, -1);
                // `gql` tag with fragment interpolation
                if (isTemplateExpression) {
                    collectTemplateInterpolations(template, INTERPOLATIONS, context);
                    // remove embed expressions
                    source = source.replace(/\$\{(.*)\}/g, "");
                }
                let queryDocument = getQueryDocument(source);
                return astify_1.default(queryDocument, INTERPOLATIONS);
            }
        }
        return ts.visitEachChild(node, visitor, context);
    };
    return visitor;
}
function getQueryDocument(source) {
    const queryDocument = graphql_tag_1.default(source);
    // http://facebook.github.io/graphql/October2016/#sec-Language.Query-Document
    if (queryDocument.definitions.length > 1) {
        for (const definition of queryDocument.definitions) {
            if (!definition.name) {
                throw new Error(`If a GraphQL query document contains multiple operations, each operation must be named.\n${source}`);
            }
        }
    }
    return queryDocument;
}
// export transformerFactory as default
function default_1() {
    return (context) => {
        return (sourceFile) => ts.visitNode(sourceFile, getVisitor(context, sourceFile));
    };
}
exports.default = default_1;
