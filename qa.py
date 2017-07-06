from match import match
import logging
import re

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

def inTwoNotOne(char, one, two):
    if re.search(char, two) and not re.search(char, one):
        return True
    else:
        return False

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
        elif any(x[2] == 11  for x in matches) :
            out = "missing gap"
        elif any(x[2] == 12  for x in matches) :
            out = "missing two hands"
        elif any(x[2] == 13  for x in matches) :
            out = "missing star signer spelling error"
        elif any(x[2] == 14  for x in matches) :
            out = "annotator spelling error"
        elif any(x[2] > 100 and x[2] <= 1000 for x in matches):
            out = "spelling error"
        else:
            out = "missing annotation/misalignment"
        return out

    def overlapcost(self, first, second):
        """
        Computes the overlap cost between first and second. Both will be
        linearly filled. First is the anno to test, second is the reference.
        """
        firstboxes  = first.getboxes(interpolate = True)
        secondboxes = second.getboxes(interpolate = True)

        logger.debug("First: {0}".format(first.label.text))
        logger.debug("Second: {0}".format(second.label.text))
        if first.label.text != second.label.text:
            # calculat edit distance, if it is above 7, then declare it wrong.
            edit_dist = levenshteinDistance(first.label.text, second.label.text)
            logger.debug(edit_dist)
            if edit_dist > 7:
                logger.debug("too much misspelling")
                return 1001
            # if it is less than three, see if the issue is missing diacritics
            # if it is, return an error code to be used later.
            elif edit_dist < 3:
                if inTwoNotOne("\!", first.label.text, second.label.text):
                    logger.debug("exclam")
                    return 11
                if inTwoNotOne("\:", first.label.text, second.label.text):
                    logger.debug("semicolon")
                    return 12
            # if the goldstandard has a star in it, the checking is more complicated
            # check if the edit distance from the correct target is close enough
            # to the annotation given, and only then warn about the star.
            if re.search("\*", second.label.text):
                gs_split = re.split("\*", second.label.text)
                sub_dist = levenshteinDistance(first.label.text, gs_split[1])
                logger.debug(gs_split)
                logger.debug(sub_dist)
                logger.debug("just outside of star")
                if sub_dist < 3 and inTwoNotOne("\*", first.label.text, second.label.text):
                    logger.debug("missing star")
                    return 13
                logger.debug("star exists, but there is another error")
                return 14
            return edit_dist*100
        if len(firstboxes) != len(secondboxes):
            return 1001
        cost = 0
        logger.debug("Past the ifs")

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
