
module.exports.isMinified= async (content) => {
    
    if (!content) return true;
    if (content.length === 0) return true;

    const total = content.length - 1;

    const semicolons = (content.match(/;/g) || []).length
    const linebreaks = (content.match(/\n/g) || []).length

    if (linebreaks < 2) return true;

    return (semicolons / linebreaks > 1 && linebreaks / total < 0.01);
}