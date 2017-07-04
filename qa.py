from match import match
import logging

logger = logging.getLogger("vatic.qa")
hdlr = logging.FileHandler('/var/www/vatic-dev/public/vatic-qa.log')
logger.addHandler(hdlr)
logger.setLevel(logging.DEBUG)

def levenshteinDistance(s1, s2):
    if len(s1) > len(s2):
        s1, s2 = s2, s1

    distances = range(len(s1) + 1)
    for i2, c2 in enumerate(s2):
        distances_ = [i2+1]
        for i1, c1 in enumerate(s1):
            if c1 == c2:
                distances_.append(distances[i1])
            else:
                distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
        distances = distances_
    return distances[-1]

class tolerable(object):
    """
    Tests if two paths agree by tolerable guidelines.
    """
    def __init__(self, overlap = 0.5, tolerance = 0.1, mistakes = 0):
        self.overlap = overlap
        self.tolerance = tolerance
        self.mistakes = mistakes

    def __call__(self, first, second):
        """
        Allows this object to be called as a function to invoke validation.
        """
        return self.validate(first, second)

    def validate(self, first, second):
        """
        Compares first to second to determine if they sufficiently agree.
        """
        matches = match(first, second,
                        lambda x, y: self.overlapcost(x, y))
            
        logger.debug("matches!")
        logger.debug(matches)
        
        if sum(x[2] != 0 for x in matches) <= self.mistakes:
            out = "all good"
        elif sum(x[2] for x in matches) > 100 and sum(x[2] for x in matches) < 10000 :
            out = "spelling error"
        else:
            out = "wrong"
        return out

    def overlapcost(self, first, second):
        """
        Computes the overlap cost between first and second. Both will be
        linearly filled.
        """
        firstboxes  = first.getboxes(interpolate = True)
        secondboxes = second.getboxes(interpolate = True)

        horrible = max(len(firstboxes), len(secondboxes)) + 1

        if first.label.text != second.label.text:
            return levenshteinDistance(first.label.text, second.label.text)*100
        if len(firstboxes) != len(secondboxes):
            return 10000
        cost = 0
        logger.debug("Past the ifs")

        logger.debug(first.label.text)
        logger.debug(first.label.text)

        for f, s in zip(firstboxes, secondboxes):
            if f.lost != s.lost:
                cost += 1
            elif f.percentoverlap(s) < self.overlap:
                cost += 0
        logger.debug("Total cost: {0}".format(cost - float(len(firstboxes)) * self.tolerance))

        return max(0, cost - float(len(firstboxes)) * self.tolerance)

    def __hash__(self):
        """
        Computes a hash for this type. Breaks duck typing because we hash on
        the type of the object as well.
        """
        return hash((type(self), self.overlap, self.tolerance, self.mistakes))

    def __eq__(self, other):
        """
        Checks equality between objects. Breaks duck typing because the types
        must now match.
        """
        try:
            return (self.overlap == other.overlap and
                    self.tolerance == other.tolerance and
                    self.mistakes == other.mistakes and
                    type(self) is type(other))
        except AttributeError:
            return False

    def __ne__(self, other):
        """
        Checks inequality between classes. See __eq__().
        """
        return not (self == other)

    def __repr__(self):
        return "tolerable({0}, {1}, {2})".format(self.overlap,
                                                 self.tolerance,
                                                 self.mistakes)
